---
name: 3d-landing
description: Use when building, changing or reviewing the NEXUS 3D landing in this repo.
---

# 3D Landing Workflow

1. Read `AGENTS.md` and `docs/brief.md`.
2. Inspect the current project state.
3. Write a short plan before editing.
4. Create a Git checkpoint before a large change.
5. Build the smallest complete version first.
6. From the repository root, run `npm run lint`, `npm run build` and the asset-size check (`public/models/ai-core.glb`, must stay below 5 MB).
7. If the 3D object changes, edit `assets/build_ai_core.py` and run `BLENDER=/path/to/blender npm run model:build`; never hand-edit the GLB.
8. Keep interface copy Russian and in sync with `docs/brief.md`.
7. Review against the brief; fix blockers and major issues.
8. Do not report completion until every check passes.
