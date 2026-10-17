"""Spatial fields belong in files; database rows store only a relative artifact URI.

This format is for future numerical arrays, not simulated data supplied by Phase 2.
"""
from pathlib import Path
from uuid import UUID
import os
import numpy as np


def save_fields(root: Path, job_id: UUID, fields: dict[str, np.ndarray]) -> str:
    root = root.resolve()
    if not fields or any(not name.isidentifier() for name in fields):
        raise ValueError('Use nonempty named numerical fields')
    for value in fields.values():
        if not isinstance(value, np.ndarray) or value.dtype.kind not in 'fiub' or not np.all(np.isfinite(value)):
            raise ValueError('Only finite numeric arrays are supported')
    folder = root / str(UUID(str(job_id)))
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / 'fields.npz'
    temporary = folder / 'fields.tmp'
    with temporary.open('wb') as stream:
        np.savez_compressed(stream, **fields)
    os.replace(temporary, target)
    return target.relative_to(root).as_posix()


def load_fields(root: Path, uri: str) -> dict[str, np.ndarray]:
    root = root.resolve()
    target = (root / uri).resolve()
    if not target.is_relative_to(root) or target.suffix != '.npz':
        raise ValueError('Artifact URI must point to an NPZ inside the artifact root')
    with np.load(target, allow_pickle=False) as archive:
        return {key: archive[key] for key in archive.files}
