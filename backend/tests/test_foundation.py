import copy
import importlib
import time
from uuid import uuid4
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import inspect, select
from app.main import create_app, MODULES
from app.settings import Settings
from app.jobs import DevelopmentExecutor, FoundationRunner
from app.models import SimulationJob, ParameterSnapshot
from app.parameters import baseline, to_si
from app.physics import UnsupportedPhysics


def migrate(url):
    cfg = Config('alembic.ini')
    cfg.set_main_option('sqlalchemy.url', url)
    command.upgrade(cfg, 'head')
    return cfg


@pytest.fixture
def setup(tmp_path, monkeypatch):
    monkeypatch.delenv('DATABASE_URL', raising=False)
    url = 'sqlite:///' + (tmp_path / 'test.db').as_posix()
    cfg = migrate(url)
    app = create_app(Settings(database_url=url, poll_interval=0.01))
    with TestClient(app) as client:
        yield client, app, cfg


def payload():
    return baseline().model_dump(mode='json')


def wait_terminal(client, job_id):
    deadline = time.monotonic() + 4
    while time.monotonic() < deadline:
        response = client.get('/simulations/' + job_id)
        assert response.status_code == 200
        if response.json()['status'] in ('completed', 'failed'):
            return response.json()
        time.sleep(0.01)
    pytest.fail('Job did not reach a terminal state')


def test_metadata_and_baseline(setup):
    client, _, _ = setup
    for path in ('/health', '/capabilities', '/model-info', '/parameters/baseline', '/parameters/schema', '/validation-standards'):
        assert client.get(path).status_code == 200
    assert client.get('/capabilities').json()['solverImplemented'] is False
    response = client.get('/parameters/baseline').json()
    assert response['configuration']['values']['ceIV'] == 0.001
    assert any('0.004' in issue['message'] for issue in response['review']['issues'])
    assert client.post('/configurations/validate', json=payload()).json()['valid']


@pytest.mark.parametrize('field,value', [('znII', -1), ('ceIV', 0), ('height', 0), ('width', -1), ('porosity', 1), ('porosity', 0), ('cycles', 1.5), ('cycles', 0), ('cycles', 1001), ('temperature', -273.15), ('currentDensity', 0), ('reservoirVolume', 0), ('flowRate', 0), ('cutoff', 0), ('znII', '1.5'), ('znII', True)])
def test_reject_invalid_values(setup, field, value):
    client, _, _ = setup
    config = payload(); config['values'][field] = value
    assert client.post('/simulations', json=config).status_code == 422
    assert client.get('/simulations').json()['total'] == 0


def test_reject_units_extras_and_settings(setup):
    client, _, _ = setup
    for mutate in (lambda p:p['units'].update(temperature='K'), lambda p:p.update(seed=-1), lambda p:p.update(seed=True), lambda p:p.update(model='invented'), lambda p:p.update(zincInventory=1), lambda p:p.update(unexpected=1), lambda p:p['values'].pop('height')):
        config = payload(); mutate(config)
        assert client.post('/simulations', json=config).status_code == 422
    assert client.get('/simulations?limit=0').status_code == 422
    assert client.get('/simulations/not-a-uuid').status_code == 422
    assert client.get('/simulations/' + str(uuid4())).status_code == 404


def test_si_conversions():
    result = to_si(baseline())
    expected = dict(temperature=323.15, currentDensity=250, flowRate=65e-6/60, reservoirVolume=30e-6,
                    chargeDuration=3600, znII=1500, ceIV=1, membrane=180e-6, area=9e-4)
    for key, value in expected.items():
        assert result[key] == pytest.approx(value)


def test_jobs_failure_snapshot_and_reproducibility(setup):
    client, app, _ = setup
    original = payload()
    ids = []
    for _ in range(2):
        response = client.post('/simulations', json=original)
        assert response.status_code == 202
        ids.append(response.json()['jobId'])
    assert ids[0] != ids[1]
    jobs = [wait_terminal(client, job_id) for job_id in ids]
    assert jobs[0]['configurationHash'] == jobs[1]['configurationHash']
    for job in jobs:
        assert job['error']['code'] == 'SOLVER_NOT_IMPLEMENTED'
        assert job['status'] == 'failed'
        assert job['plots'] == {} and job['resultSummary'] is None
        assert job['validationStatus'] == 'not-validated'
        assert job['createdAt'] <= job['startedAt'] <= job['finishedAt']
    original['values']['temperature'] = 99
    with app.state.sessions() as session:
        stored = session.scalar(select(ParameterSnapshot))
        assert stored.configuration['values']['temperature'] == 50
        assert stored.si_values['temperature'] == 323.15
        assert len(stored.provenance) == 20
    assert client.get('/simulations?limit=1&offset=1').json()['total'] == 2


def test_case_storage(setup):
    client, _, _ = setup
    response = client.post('/cases', json={'name':'  Baseline  ', 'configuration':payload()})
    assert response.status_code == 201
    assert response.json()['name'] == 'Baseline'
    assert client.get('/cases').json()[0]['id'] == response.json()['id']
    assert client.post('/cases', json={'name':' ', 'configuration':payload()}).status_code == 422


def test_migration_schema_and_downgrade(setup):
    _, app, cfg = setup
    assert set(inspect(app.state.engine).get_table_names()) == {'alembic_version','simulation_cases','parameter_snapshots','simulation_jobs','result_summaries','experimental_datasets','validation_runs'}
    # No queued jobs; downgrade/upgrade demonstrates reversibility of the frozen revision.
    command.downgrade(cfg, 'base')
    assert inspect(app.state.engine).get_table_names() == ['alembic_version']
    command.upgrade(cfg, 'head')


def test_restart_persistence_and_running_recovery(tmp_path, monkeypatch):
    monkeypatch.delenv('DATABASE_URL', raising=False)
    url = 'sqlite:///' + (tmp_path/'restart.db').as_posix()
    migrate(url)
    class PausedExecutor:
        def __init__(self, *args): pass
        def start(self): pass
        def stop(self): pass
    first = create_app(Settings(database_url=url), executor_factory=PausedExecutor)
    with TestClient(first) as client:
        one = client.post('/simulations', json=payload()).json()['jobId']
        two = client.post('/simulations', json=payload()).json()['jobId']
        assert client.get('/simulations/'+one).json()['status'] == 'queued'
        with first.state.sessions.begin() as session:
            session.get(SimulationJob, two).status = 'running'
    second = create_app(Settings(database_url=url, poll_interval=0.01))
    with TestClient(second) as client:
        assert wait_terminal(client, one)['error']['code'] == 'SOLVER_NOT_IMPLEMENTED'
        assert wait_terminal(client, two)['error']['code'] == 'WORKER_INTERRUPTED'
        assert client.get('/simulations').json()['total'] == 2


def test_replacement_runner_lifecycle(tmp_path, monkeypatch):
    monkeypatch.delenv('DATABASE_URL', raising=False)
    url = 'sqlite:///' + (tmp_path/'runner.db').as_posix(); migrate(url)
    class InfrastructureFixture:
        version = 'test-fixture-only'
        def run(self, configuration):
            return {'fixture': True} # Infrastructure fixture, never scientific data.
    app = create_app(Settings(database_url=url, poll_interval=0.01), runner=InfrastructureFixture())
    with TestClient(app) as client:
        job_id = client.post('/simulations', json=payload()).json()['jobId']
        result = wait_terminal(client, job_id)
        assert result['status'] == 'completed'
        assert result['resultSummary'] == {'fixture': True}
        assert result['validationStatus'] == 'not-validated'


def test_no_fake_physics():
    for name in MODULES:
        module = importlib.import_module('app.physics.' + name).Module()
        with pytest.raises(UnsupportedPhysics):
            module.evaluate(baseline())


def test_cors(setup):
    client, _, _ = setup
    headers={'Origin':'http://localhost:5173', 'Access-Control-Request-Method':'POST'}
    assert client.options('/simulations', headers=headers).status_code == 200
    headers['Origin'] = 'http://untrusted.invalid'
    assert client.options('/simulations', headers=headers).status_code == 400


@pytest.mark.parametrize('value', ['NaN', 'Infinity', '-Infinity'])
def test_nonfinite_json_rejected(setup, value):
    import json
    client, _, _ = setup
    body = json.dumps(payload()).replace('"temperature": 50.0', '"temperature": '+value)
    assert value in body
    assert client.post('/simulations', content=body, headers={'Content-Type':'application/json'}).status_code == 422


def test_artifacts(tmp_path):
    import numpy as np
    from app.artifacts import save_fields, load_fields
    uri = save_fields(tmp_path, uuid4(), {'fixture': np.arange(12).reshape(3,4)})
    assert np.array_equal(load_fields(tmp_path, uri)['fixture'], np.arange(12).reshape(3,4))
    with pytest.raises(ValueError): load_fields(tmp_path, '../outside.npz')
    with pytest.raises(ValueError): save_fields(tmp_path, uuid4(), {'bad':np.array([float('nan')])})
