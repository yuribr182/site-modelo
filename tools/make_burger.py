# ============================================================
# make_burger.py — modela o lanche no Blender e exporta .glb
#
# Este script faz, via código, o que um artista 3D faria à mão
# no Blender: cria cada ingrediente como um objeto SEPARADO
# (essencial para a animação de "explodir" os ingredientes)
# e exporta tudo como assets/models/burger.glb.
#
# Rodar:  python3 tools/make_burger.py   (requer `pip install bpy`)
# ============================================================

import math
import random
import bpy
import bmesh
from mathutils import Vector

random.seed(7)

# Cena vazia
bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, roughness, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def finish(obj, name, mat, subsurf=0, smooth=True):
    obj.name = name
    obj.data.name = name
    obj.data.materials.append(mat)
    if subsurf:
        mod = obj.modifiers.new("Subsurf", "SUBSURF")
        mod.levels = subsurf
        mod.render_levels = subsurf
    if smooth:
        bpy.ops.object.shade_smooth()
    return obj


def organic(obj, amount=0.01):
    """Bagunça de leve os vértices para não parecer 'geométrico'."""
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.transform.vertex_random(offset=amount, seed=3)
    bpy.ops.object.mode_set(mode="OBJECT")


def displace_noise(obj, strength, size=0.35):
    """Textura de nuvem deslocando a superfície = aspecto de comida."""
    tex = bpy.data.textures.new(obj.name + "Noise", type="CLOUDS")
    tex.noise_scale = size
    mod = obj.modifiers.new("Displace", "DISPLACE")
    mod.texture = tex
    mod.strength = strength


# Paleta (cores lineares aproximadas)
MAT_BUN = material("Bun", (0.80, 0.42, 0.13), 0.55)
MAT_SEED = material("Seed", (0.93, 0.80, 0.52), 0.5)
MAT_PATTY = material("Patty", (0.22, 0.10, 0.05), 0.85)
MAT_CHEESE = material("Cheese", (0.95, 0.62, 0.08), 0.45)
MAT_TOMATO = material("Tomato", (0.70, 0.06, 0.04), 0.35)
MAT_LETTUCE = material("Lettuce", (0.20, 0.48, 0.08), 0.5)
MAT_ONION = material("Onion", (0.88, 0.82, 0.92), 0.3)

# ---------- Pão de baixo ----------
bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=0.34, location=(0, 0, 0.17))
bun_bottom = bpy.context.object
mod = bun_bottom.modifiers.new("Bevel", "BEVEL")
mod.width = 0.09
mod.segments = 5
finish(bun_bottom, "BunBottom", MAT_BUN, subsurf=1)
organic(bun_bottom, 0.012)

# ---------- Hambúrguer (carne) ----------
bpy.ops.mesh.primitive_cylinder_add(radius=1.06, depth=0.30, vertices=48, location=(0, 0, 0.52))
patty = bpy.context.object
mod = patty.modifiers.new("Bevel", "BEVEL")
mod.width = 0.07
mod.segments = 4
finish(patty, "Patty", MAT_PATTY, subsurf=2)
organic(patty, 0.02)
displace_noise(patty, 0.05, 0.22)

# ---------- Queijo derretido (grade com pontas caídas) ----------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=24, size=2.3, location=(0, 0, 0.72))
cheese = bpy.context.object
me = cheese.data
for v in me.vertices:
    d = max(abs(v.co.x), abs(v.co.y)) - 0.82   # o que passa da carne...
    if d > 0:
        v.co.z -= 1.5 * d * d                   # ...derrete para baixo
mod = cheese.modifiers.new("Solidify", "SOLIDIFY")
mod.thickness = 0.05
finish(cheese, "Cheese", MAT_CHEESE, subsurf=1)

# ---------- Tomate ----------
bpy.ops.mesh.primitive_cylinder_add(radius=0.92, depth=0.13, vertices=48, location=(0, 0, 0.86))
tomato = bpy.context.object
mod = tomato.modifiers.new("Bevel", "BEVEL")
mod.width = 0.04
mod.segments = 3
finish(tomato, "Tomato", MAT_TOMATO, subsurf=1)

# ---------- Alface (disco com babados) ----------
bpy.ops.mesh.primitive_circle_add(vertices=96, radius=1.3, fill_type="TRIFAN", location=(0, 0, 1.0))
lettuce = bpy.context.object
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.subdivide(number_cuts=2)
bpy.ops.object.mode_set(mode="OBJECT")
me = lettuce.data
for v in me.vertices:
    r = math.hypot(v.co.x, v.co.y)
    ang = math.atan2(v.co.y, v.co.x)
    ripple = math.sin(ang * 9.0) * (r / 1.3) ** 2   # babado cresce na borda
    v.co.z += ripple * 0.14
    v.co.x *= 1.0 + 0.06 * math.sin(ang * 5.0) * (r / 1.3)
    v.co.y *= 1.0 + 0.06 * math.cos(ang * 4.0) * (r / 1.3)
mod = lettuce.modifiers.new("Solidify", "SOLIDIFY")
mod.thickness = 0.03
finish(lettuce, "Lettuce", MAT_LETTUCE, subsurf=1)

# ---------- Anéis de cebola ----------
rings = []
for i, (x, y) in enumerate([(-0.35, 0.2), (0.4, -0.1), (0.0, -0.45)]):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.30, minor_radius=0.055,
        location=(x, y, 1.13),
        rotation=(random.uniform(-0.25, 0.25), random.uniform(-0.25, 0.25), 0),
    )
    rings.append(bpy.context.object)
    bpy.ops.object.shade_smooth()
for r in rings:
    r.select_set(True)
bpy.context.view_layer.objects.active = rings[0]
bpy.ops.object.join()
onion = bpy.context.object
onion.name = "Onion"
onion.data.name = "Onion"
onion.data.materials.append(MAT_ONION)

# ---------- Pão de cima (domo) ----------
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1.12, location=(0, 0, 0))
bun_top = bpy.context.object
me = bun_top.data
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.02], context="VERTS")
edges = [e for e in bm.edges if e.is_boundary]
bmesh.ops.holes_fill(bm, edges=edges)
bm.to_mesh(me)
bm.free()
bun_top.scale = (1.0, 1.0, 0.62)
bun_top.location = (0, 0, 1.22)
bpy.ops.object.transform_apply(scale=True, location=False)
finish(bun_top, "BunTop", MAT_BUN, subsurf=1)
organic(bun_top, 0.012)

# ---------- Gergelim espalhado no domo ----------
seeds = []
for i in range(48):
    theta = random.uniform(0.12, 1.05)          # do topo até a lateral
    phi = random.uniform(0, 2 * math.pi)
    direction = Vector((
        math.sin(theta) * math.cos(phi),
        math.sin(theta) * math.sin(phi),
        math.cos(theta) * 0.62,                  # domo é achatado em z
    ))
    direction.normalize()
    pos = Vector((0, 0, 1.22)) + Vector((
        1.12 * math.sin(theta) * math.cos(phi),
        1.12 * math.sin(theta) * math.sin(phi),
        1.12 * 0.62 * math.cos(theta),
    ))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.045, location=pos)
    seed = bpy.context.object
    seed.scale = (1.0, 0.55, 1.35)
    seed.rotation_mode = "QUATERNION"
    seed.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction)
    bpy.ops.object.shade_smooth()
    seeds.append(seed)
for s in seeds:
    s.select_set(True)
bpy.context.view_layer.objects.active = seeds[0]
bpy.ops.object.join()
seed_obj = bpy.context.object
seed_obj.name = "Seeds"
seed_obj.data.name = "Seeds"
seed_obj.data.materials.append(MAT_SEED)

# ---------- Exporta glTF binário com modificadores aplicados ----------
import os
out = os.path.join(os.path.dirname(__file__), "..", "assets", "models", "burger.glb")
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(out), export_format="GLB", export_apply=True)
print("Exportado:", os.path.abspath(out))
