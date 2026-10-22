"""Build the NEXUS "AI Core" model and export it as GLB.

Usage (from the repository root):
    blender -b --python assets/build_ai_core.py

Outputs:
    assets/ai-core.blend    editable source scene
    assets/ai-core.glb      runtime asset (copy into public/models/)

Design rules:
    * one smooth graphite core
    * three closed tori, each on its own radial band so they never intersect
    * cyan / violet tori stay emissive, graphite/steel stay metallic
"""

import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
BLEND_PATH = os.path.join(ASSETS_DIR, "ai-core.blend")
GLB_PATH = os.path.join(ASSETS_DIR, "ai-core.glb")

GRAPHITE = "AI_Core_Graphite"
STEEL = "AI_Core_Steel"
CYAN = "AI_Core_Cyan"
VIOLET = "AI_Core_Violet"

# --- geometry -------------------------------------------------------------
# Every part owns a disjoint distance-from-origin band, so the closed tori can
# never intersect each other or the core:
#   core 0.000-0.640 | steel 0.705-0.795 | violet 0.827-0.917 | cyan 0.962-1.078
CORE_RADIUS = 0.64
CORE_SUBDIVISIONS = 3

RINGS = [
    {
        "name": "ring_steel",
        "material": STEEL,
        "radius": 0.750,
        "tube": 0.045,
        "normal": (0.350, -0.450, 0.820),
        "tilt_ref": (-0.157, 0.209, 0.965),
        "segments": 224,
        "profile_segments": 18,
    },
    {
        "name": "ring_violet",
        "material": VIOLET,
        "radius": 0.872,
        "tube": 0.045,
        "normal": (0.203, 0.143, 0.969),
        "tilt_ref": (-0.772, 0.632, 0.068),
        "segments": 256,
        "profile_segments": 18,
    },
    {
        "name": "ring_cyan",
        "material": CYAN,
        "radius": 1.020,
        "tube": 0.058,
        "normal": (0.240, -0.896, 0.375),
        "tilt_ref": (-0.072, -0.401, -0.913),
        "segments": 288,
        "profile_segments": 20,
    },
]

# --- materials ------------------------------------------------------------
MATERIALS = {
    GRAPHITE: {
        "base": (0.095, 0.105, 0.130),
        "metallic": 0.28,
        "roughness": 0.46,
        "coat": 0.25,
        "coat_roughness": 0.20,
    },
    STEEL: {
        "base": (0.240, 0.260, 0.300),
        "metallic": 0.45,
        "roughness": 0.30,
        "coat": 0.30,
        "coat_roughness": 0.18,
    },
    CYAN: {
        "base": (0.008, 0.175, 0.255),
        "metallic": 0.0,
        "roughness": 0.34,
        "coat": 0.22,
        "coat_roughness": 0.22,
        "emission": (0.0, 0.700, 0.950),
        "strength": 0.95,
    },
    VIOLET: {
        "base": (0.115, 0.050, 0.330),
        "metallic": 0.0,
        "roughness": 0.34,
        "coat": 0.22,
        "coat_roughness": 0.22,
        "emission": (0.300, 0.110, 1.0),
        "strength": 0.55,
    },
}


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def build_material(name, spec):
    material = bpy.data.materials.new(name)
    if not material.use_nodes:
        material.use_nodes = True
    bsdf = material.node_tree.nodes["Principled BSDF"]
    inputs = bsdf.inputs
    inputs["Base Color"].default_value = (*spec["base"], 1.0)
    inputs["Metallic"].default_value = spec["metallic"]
    inputs["Roughness"].default_value = spec["roughness"]
    if "coat" in spec:
        inputs["Coat Weight"].default_value = spec["coat"]
        inputs["Coat Roughness"].default_value = spec["coat_roughness"]
    if "emission" in spec:
        inputs["Emission Color"].default_value = (*spec["emission"], 1.0)
        inputs["Emission Strength"].default_value = spec["strength"]
    return material


def plane_matrix(normal, tilt_ref):
    """Orthonormal basis with +Z on `normal` and +X as close to `tilt_ref` as possible."""
    z_axis = Vector(normal).normalized()
    x_axis = (Vector(tilt_ref) - z_axis * Vector(tilt_ref).dot(z_axis)).normalized()
    y_axis = z_axis.cross(x_axis)
    return Matrix(
        (
            (x_axis.x, y_axis.x, z_axis.x),
            (x_axis.y, y_axis.y, z_axis.y),
            (x_axis.z, y_axis.z, z_axis.z),
        )
    )


def ring_mesh(spec):
    """Closed torus lying in the XY plane, normal +Z."""
    radius = spec["radius"]
    tube = spec["tube"]
    segments = spec["segments"]
    profile = spec["profile_segments"]

    bm = bmesh.new()
    grid = []
    for i in range(segments):
        u = 2.0 * math.pi * i / segments
        cu, su = math.cos(u), math.sin(u)
        row = []
        for j in range(profile):
            v = 2.0 * math.pi * j / profile
            r = radius + tube * math.cos(v)
            row.append(bm.verts.new((r * cu, r * su, tube * math.sin(v))))
        grid.append(row)
    bm.verts.ensure_lookup_table()

    for i in range(segments):
        for j in range(profile):
            a = grid[i][j]
            b = grid[i][(j + 1) % profile]
            c = grid[(i + 1) % segments][(j + 1) % profile]
            d = grid[(i + 1) % segments][j]
            bm.faces.new((a, b, c, d))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.transform(plane_matrix(spec["normal"], spec["tilt_ref"]).to_4x4())
    return bm


def mesh_object(name, bm, material_index, slot_list, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    for face in me.polygons:
        face.use_smooth = smooth
    me.materials.append(slot_list[material_index])
    me.polygons.foreach_set("material_index", [material_index] * len(me.polygons))
    me.update()
    return obj


def add_camera_and_lights():
    cam_data = bpy.data.cameras.new("Camera_AI_Core")
    cam = bpy.data.objects.new("Camera_AI_Core", cam_data)
    cam.location = (2.9, -3.4, 2.1)
    cam.rotation_euler = (math.radians(64.83), 0.0, math.radians(40.46))
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    key_data = bpy.data.lights.new("Light_Key", type="AREA")
    key_data.energy = 320.0
    key_data.size = 4.0
    key = bpy.data.objects.new("Light_Key", key_data)
    key.location = (-2.4, -2.6, 2.9)
    key.rotation_euler = (math.radians(50.66), 0.0, math.radians(-42.71))
    bpy.context.scene.collection.objects.link(key)

    rim_data = bpy.data.lights.new("Light_Rim", type="AREA")
    rim_data.energy = 220.0
    rim_data.size = 3.0
    rim_data.color = (0.65, 0.55, 1.0)
    rim = bpy.data.objects.new("Light_Rim", rim_data)
    rim.location = (2.9, 2.5, 1.7)
    rim.rotation_euler = (math.radians(66.06), 0.0, math.radians(130.76))
    bpy.context.scene.collection.objects.link(rim)


def main():
    reset_scene()

    slot_order = [GRAPHITE, STEEL, CYAN, VIOLET]
    slot_materials = [build_material(name, MATERIALS[name]) for name in slot_order]
    index = {name: i for i, name in enumerate(slot_order)}

    core = bmesh.new()
    bmesh.ops.create_icosphere(core, subdivisions=CORE_SUBDIVISIONS, radius=CORE_RADIUS)
    parts = [mesh_object("core", core, index[GRAPHITE], slot_materials)]

    for spec in RINGS:
        parts.append(
            mesh_object(
                spec["name"],
                ring_mesh(spec),
                index[spec["material"]],
                slot_materials,
            )
        )

    for obj in bpy.context.scene.objects:
        obj.select_set(False)
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    core_obj = bpy.context.view_layer.objects.active
    core_obj.name = "AI_Core"
    core_obj.data.name = "AI_Core"
    core_obj.select_set(False)

    add_camera_and_lights()

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

    for obj in bpy.context.scene.objects:
        obj.select_set(obj.type == "MESH")
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
    )

    stats = {
        "verts": len(core_obj.data.vertices),
        "tris": sum(len(p.vertices) - 2 for p in core_obj.data.polygons),
        "materials": [m.name for m in core_obj.data.materials],
    }
    print("AI_CORE_BUILD", stats)


main()
