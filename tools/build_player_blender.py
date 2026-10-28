"""Run: blender -b --python tools/build_player_blender.py
Produces editable rig, GLB and embedded game geometry without external services.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assets/player'; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
parts={}; source=bpy.data.collections.new('Editable mesh library'); bpy.context.scene.collection.children.link(source)
def cv(v):return (v[0],-v[2],v[1])
def mesh(name,verts,faces):
 m=bpy.data.meshes.new(name);m.from_pydata([cv(v) for v in verts],[],faces);m.update()
 ob=bpy.data.objects.new(name,m);source.objects.link(ob)
 for p in m.polygons:p.use_smooth=True
 parts[name]=ob;ob.hide_render=True;ob.hide_set(True);return ob
# Elliptic rings give continuous tailored silhouettes instead of joined blocks.
def rings(name,profile,n=20):
 vs=[];faces=[]
 for y,rx,rz,zc in profile:
  for j in range(n):
   a=2*math.pi*j/n;vs.append((rx*math.cos(a),y,zc+rz*math.sin(a)))
 for i in range(len(profile)-1):
  for j in range(n):a=i*n+j;b=i*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 faces += [tuple(range(n-1,-1,-1)),tuple((len(profile)-1)*n+j for j in range(n))]
 return mesh(name,vs,faces)
def oval(name,scale,offset=(0,0,0),segments=20,rows=12):
 vs=[];faces=[]
 for i in range(rows+1):
  a=math.pi*i/rows
  for j in range(segments):
   b=2*math.pi*j/segments;vs.append((offset[0]+scale[0]*math.sin(a)*math.cos(b),offset[1]+scale[1]*math.cos(a),offset[2]+scale[2]*math.sin(a)*math.sin(b)))
 for i in range(rows):
  for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;faces.append((a,a+segments,b+segments,b))
 return mesh(name,vs,faces)
rings('skinTorso',[(1.035,.153,.107,0),(1.07,.158,.11,0),(1.12,.156,.106,0),(1.2,.172,.12,0),(1.29,.192,.132,0),(1.37,.217,.14,0),(1.43,.244,.135,0),(1.475,.236,.12,0),(1.51,.18,.10,0),(1.545,.075,.057,0),(1.558,.063,.05,0)],28)
rings('pelvis',[(-.09,.11,.085,0),(-.065,.153,.105,0),(.01,.163,.113,0),(.08,.156,.11,0),(.115,.153,.107,0)],24)
rings('head',[(-.052,.035,.042,.006),(-.035,.068,.074,.012),(0,.089,.09,.004),(.055,.105,.104,0),(.104,.102,.1,-.005),(.137,.078,.078,-.006),(.153,.03,.034,-.005)],24)
rings('neck',[(-.05,.052,.049,0),(0,.05,.048,0),(.05,.047,.046,0)],16)
for name,length,radii in [('thigh',.44,(.086,.086,.064)),('shinP',.25,(.072,.076,.063)),('sock',.31,(.064,.062,.048)),('ua',.29,(.06,.068,.048)),('fa',.24,(.051,.054,.037)),('sleeve',.19,(.073,.081,.067))]:
 rings(name,[(-length/2,radii[2],radii[2]*.9,0),(-length*.25,radii[1],radii[1]*.9,0),(length*.22,radii[0],radii[0]*.94,0),(length/2,radii[0]*.9,radii[0]*.88,0)],18)
oval('hand',(.042,.059,.035),offset=(0,-.01,.005));oval('ear',(.022,.033,.015))
# Sneaker upper and broad rounded toe are shaped along the heel-to-toe axis.
vs=[];faces=[];n=20
for z,w,h,yc in [(-.083,.036,.026,-.005),(-.06,.053,.044,.004),(.005,.056,.047,.007),(.08,.059,.033,-.006),(.15,.047,.026,-.012),(.175,.018,.016,-.012)]:
 for i in range(n):a=i*2*math.pi/n;vs.append((w*math.cos(a),yc+h*math.sin(a),z))
for row in range(5):
 for j in range(n):a=row*n+j;b=row*n+(j+1)%n;faces.append((a,a+n,b+n,b))
faces+=[tuple(range(n-1,-1,-1)),tuple(5*n+j for j in range(n))];mesh('shoe',vs,faces)
def dome(name,rx,ry,rz,depth):
 profile=[]
 for i in range(11):
  a=depth*i/10;profile.append((ry*math.cos(a),max(.001,rx*math.sin(a)),max(.001,rz*math.sin(a)),0))
 return rings(name,list(reversed(profile)),24)
dome('cap',.12,.115,.125,math.pi/2);dome('helm',.132,.124,.14,math.pi*.62)
# Curved bill: low profile rather than a flat cylinder.
vs=[];faces=[]
for i in range(7):
 f=i/6
 for j in range(17):
  u=-1+2*j/16;vs.append((u*(.085+.012*f),-.01*u*u-.008*f,.015+f*(.11-.025*u*u)))
for i in range(6):
 for j in range(16):a=i*17+j;faces.append((a,a+1,a+18,a+17))
ob=mesh('brim',vs,faces);bpy.context.view_layer.objects.active=ob;ob.hide_set(False);mod=ob.modifiers.new('Bill thickness','SOLIDIFY');mod.thickness=.009;bpy.ops.object.modifier_apply(modifier=mod.name);ob.hide_set(True)
oval('flap',(.027,.068,.065),offset=(0,-.005,.005))
# Glove silhouette includes finger lobes; the mesh stays a single game draw call.
base=oval('glove',(.092,.116,.046),(0,-.04,.025));pieces=[base]
for i in range(4):pieces.append(oval('finger'+str(i),(.022,.07,.026),(-.061+i*.036,.012,.028)))
bpy.ops.object.select_all(action='DESELECT')
for o in pieces:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=base;bpy.ops.object.join();base.name='glove'
for i in range(4):parts.pop('finger'+str(i))
base.hide_set(True);base.hide_render=True
rings('sleeve',[(-.095,.067,.061,0),(-.065,.078,.073,0),(.01,.078,.073,0),(.055,.065,.063,0),(.083,.038,.038,0),(.095,.004,.004,0)],20)
rings('belt',[(-.018,.166,.166,0),(.018,.166,.166,0)],24)
oval('faceEye',(.007,.005,.004));rings('faceNose',[(-.022,.008,.007,.005),(-.012,.014,.012,.008),(-.002,.012,.014,.008),(.018,.006,.008,0),(.03,.002,.004,-.004)],16)
# Sculpted hand: palm, four tapered fingers and a thumb form one game mesh.
palm=oval('hand',(.034,.044,.025),offset=(0,-.005,.002));hand_parts=[palm]
for i,(x,length) in enumerate([(-.024,.044),(-.008,.054),(.008,.057),(.024,.046)]):
 hand_parts.append(oval('digit'+str(i),(.009,length/2,.010),(x,-.042-length/2,.006),12,8))
hand_parts.append(oval('thumb',(.015,.033,.014),(.038,-.02,.01),12,8))
bpy.ops.object.select_all(action='DESELECT')
for ob in hand_parts:ob.hide_set(False);ob.select_set(True)
bpy.context.view_layer.objects.active=palm;bpy.ops.object.join();palm.hide_render=True;palm.hide_set(True)
for key in ['digit0','digit1','digit2','digit3','thumb']:parts.pop(key)
oval('eyeWhite',(.012,.006,.004));oval('brow',(.024,.004,.004));oval('mouth',(.023,.003,.003))
# Voxel-sculpt a continuous trouser silhouette, with no separate pelvis/knee blocks.
bpy.ops.object.select_all(action='DESELECT');pants_parts=[]
for part,x,y in [('pelvis',0,.96),('thigh',.098,.70),('thigh',-.098,.70),('shinP',.098,.38),('shinP',-.098,.38)]:
 ob=bpy.data.objects.new('Trouser sculpt',parts[part].data.copy());source.objects.link(ob);ob.location=cv((x,y,0));ob.select_set(True);pants_parts.append(ob)
bpy.context.view_layer.objects.active=pants_parts[0];bpy.ops.object.join();pants=pants_parts[0]
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);pants.data.remesh_voxel_size=.008;bpy.ops.object.voxel_remesh()
mod=pants.modifiers.new('Relax cloth surface','SMOOTH');mod.factor=.6;mod.iterations=3;bpy.ops.object.modifier_apply(modifier=mod.name)
mod=pants.modifiers.new('Game topology','DECIMATE');mod.ratio=.28;bpy.ops.object.modifier_apply(modifier=mod.name)
parts['pantsSkin']=pants;pants.hide_render=True;pants.hide_set(True)
def pants_weights(x,y):
 side=1 if x>=0 else 3
 if y>.70:
  t=max(0,min(1,(y-.86)/.13));t=t*t*(3-2*t)
  crotch=math.exp(-(x/.07)**2)*max(0,min(1,(y-.74)/.10))
  t=max(t,crotch)
  return [0,side,0,0],[t,1-t,0,0]
 t=max(0,min(1,(y-.40)/.19));t=t*t*(3-2*t);return [side,side+1,0,0],[t,1-t,0,0]
# Recalculate outward normals using Blender, then triangulate deterministic exports.
export={}
for name,ob in parts.items():
 ob.hide_set(False);
 if name=='head':
  for v in ob.data.vertices:
   v.co.z-=.045
   if v.co.y<0:
    x,h=v.co.x,v.co.z
    cheeks=.007*math.exp(-((h+.02)/.025)**2)*math.exp(-((abs(x)-.055)/.03)**2)
    sockets=.007*math.exp(-((h-.009)/.018)**2)*math.exp(-((abs(x)-.04)/.025)**2)
    v.co.y-=cheeks-sockets
 bpy.context.view_layer.objects.active=ob
 if name in {'skinTorso','head','pelvis','shoe','brim'}:
  sub=ob.modifiers.new('Sculpted smoothing','SUBSURF');sub.levels=1;bpy.ops.object.modifier_apply(modifier=sub.name)
 ob.hide_set(False);bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 me=ob.data
 for poly in me.polygons:poly.use_smooth=True
 me.update();me.calc_loop_triangles();pos=[];norm=[]
 for v in me.vertices:
  pos.extend(round(x,5) for x in (v.co.x,v.co.z,-v.co.y));norm.extend(round(x,5) for x in (v.normal.x,v.normal.z,-v.normal.y))
 export[name]={'p':pos,'n':norm,'i':[v for t in me.loop_triangles for v in t.vertices]}
 if name=='pantsSkin':
  si=[];sw=[]
  for i in range(0,len(pos),3):
   indices,weights=pants_weights(pos[i],pos[i+1]);si.extend(indices);sw.extend(round(w,6) for w in weights)
  export[name]['si']=si;export[name]['sw']=sw
 ob.hide_set(True)
# A real editable Blender armature in the same rest pose as the game's rig.
arm=bpy.data.armatures.new('Player skeleton');rig=bpy.data.objects.new('Player rig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
layout={'hips':((0,.94,0),(0,1.06,0),None),'spine':((0,1.06,0),(0,1.36,0),'hips'),'chest':((0,1.36,0),(0,1.56,0),'spine'),'head':((0,1.61,0),(0,1.78,0),'chest')}
for side,x in [('L',.215),('R',-.215)]:
 layout['arm'+side]=((x,1.48,0),(x,1.19,0),'chest');layout['forearm'+side]=((x,1.19,0),(x,.97,0),'arm'+side)
 x=.098 if side=='L' else -.098
 layout['thigh'+side]=((x,.92,0),(x,.48,0),'hips');layout['shin'+side]=((x,.48,0),(x,.05,0),'thigh'+side)
for name,(head,tail,parent) in layout.items():
 b=arm.edit_bones.new(name);b.head=cv(head);b.tail=cv(tail)
 if parent:b.parent=arm.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
def material(name,color,rough=.7):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough;return m
mats={'shirt':material('Home ivory',(.83,.85,.81)),'pants':material('Baseball pants',(.72,.76,.79)),'trim':material('Navy team color',(.018,.05,.12)),'skin':material('Skin',(.63,.36,.21)),'leather':material('Glove leather',(.26,.10,.035)),'eyes':material('Eyes',(.015,.012,.01))}
assembled=[]
def instance(name,part,offset,mat,bone):
 ob=bpy.data.objects.new(name,parts[part].data.copy());bpy.context.collection.objects.link(ob);ob.location=cv(offset);ob.data.materials.clear();ob.data.materials.append(mats[mat]);ob.parent=rig
 if part=='pantsSkin':
  groups=[ob.vertex_groups.new(name=n) for n in ['hips','thighL','shinL','thighR','shinR']]
  for v in ob.data.vertices:
   indices,weights=pants_weights(v.co.x,v.co.z)
   for idx,w in zip(indices,weights):
    if w:groups[idx].add([v.index],w,'REPLACE')
 elif part=='skinTorso':
  groups=[ob.vertex_groups.new(name=n) for n in ['hips','spine','chest']]
  for v in ob.data.vertices:
   y=v.co.z;up=y>=1.25;t=max(0,min(1,(y-(1.25 if up else 1.035))/((1.49-1.25) if up else (1.25-1.035))));w=t*t*(3-2*t);groups[1 if up else 0].add([v.index],1-w,'REPLACE');groups[2 if up else 1].add([v.index],w,'REPLACE')
 else:ob.vertex_groups.new(name=bone).add(list(range(len(ob.data.vertices))),1,'REPLACE')
 mod=ob.modifiers.new('Armature deformation','ARMATURE');mod.object=rig;assembled.append(ob);return ob
belt=instance('Belt','belt',(0,1.06,0),'trim','hips');belt.scale.y=.8
instance('Jersey','skinTorso',(0,0,0),'shirt','chest');instance('Continuous trousers','pantsSkin',(0,0,0),'pants','hips');instance('Head','head',(0,1.68,0),'skin','head');instance('Neck','neck',(0,1.56,0),'skin','chest');instance('Cap','cap',(0,1.705,-.005),'trim','head');instance('Cap bill','brim',(0,1.735,.085),'trim','head')
for i in range(3):instance('Jersey button '+str(i),'faceEye',(0,1.18+i*.07,.14),'trim','spine')
for sign in [-1,1]:
 eye=instance('Eye white '+str(sign),'eyeWhite',(sign*.039,1.689,.116),'shirt','head')
 iris=instance('Iris '+str(sign),'faceEye',(sign*.039,1.689,.121),'eyes','head');iris.scale*=.65
 instance('Brow '+str(sign),'brow',(sign*.039,1.709,.114),'eyes','head')
for sign in [-1,1]:instance('Ear '+str(sign),'ear',(sign*.105,1.67,0),'skin','head')
instance('Mouth','mouth',(0,1.625,.112),'leather','head');instance('Nose','faceNose',(0,1.655,.112),'skin','head')
for side,sign in [('L',1),('R',-1)]:
 for part,y,mat in [('sleeve',1.42,'shirt'),('ua',1.32,'trim'),('fa',1.10,'trim'),('hand',.97,'skin')]:instance(part+side,part,(sign*.215,y,0),mat,('forearm' if part in ['fa','hand'] else 'arm')+side)
 for part,y,z,mat in [('sock',.21,0,'trim'),('shoe',.02,0,'trim')]:instance(part+side,part,(sign*.098,y,z),mat,('thigh' if part=='thigh' else 'shin')+side)
instance('Fielding glove','glove',(.215,.97,.02),'leather','forearmL')
# Embed only mesh buffers; game keeps its proven animation hierarchy and material colors.
blob=json.dumps(export,separators=(',',':'))
(OUT/'player-meshes.json').write_text(blob)
page=ROOT/'index.html';html=page.read_text();begin='/* BLENDER_PLAYER_DATA_BEGIN */';end='/* BLENDER_PLAYER_DATA_END */';block=begin+'\nconst BLENDER_PLAYER='+blob+';\n'+end
if begin in html:html=html[:html.index(begin)]+block+html[html.index(end)+len(end):]
else:html=html.replace('let GEO=null;',block+'\nlet GEO=null;')
page.write_text(html)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in assembled:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(OUT/'baseball-player.glb'),export_format='GLB',use_selection=True,export_animations=False)
# Studio camera and floor remain in the editable .blend, not in the game GLB.
bpy.ops.mesh.primitive_plane_add(size=12,location=(0,0,-.025));floor=bpy.context.object;floor.name='Preview floor';floor.data.materials.append(material('Studio slate',(.055,.075,.10)))
bpy.ops.object.camera_add(location=(2.6,-5,1.9));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,.95))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=2.1
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='BLENDER_WORKBENCH';scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL';scene.display.shading.show_shadows=True;scene.display.shading.show_cavity=True;scene.display.shading.cavity_type='BOTH';scene.display.shading.background_type='WORLD';scene.world.color=(.055,.075,.10)
scene.render.resolution_x=800;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'preview.png')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'baseball-player.blend'))
bpy.ops.render.render(write_still=True)
print('BLENDER_PLAYER_BUILT',len(export),'meshes',sum(len(d['i'])//3 for d in export.values()),'triangles')
