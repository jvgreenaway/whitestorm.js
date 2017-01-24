import * as UTILS from '../../globals';

const ad = UTILS.appDefaults;

const controlsModule = new WHS.OrbitControlsModule();

const world = new WHS.App([
  ...UTILS.appModules({
    position: new THREE.Vector3(0, 0, 200)
  }, ad.rendering, ad.physics, false),
  controlsModule
]);

// controlsModule.controls.autoRotate = true;

// Create a ball
// const ball = new WHS.Sphere({
//   geometry: {
//     radius: 5,
//     widthSegments: 32,
//     heightSegments: 32
//   },

//   modules: [
//     new PHYSICS.SphereModule({
//       mass: 10,
//       restitution: 3,
//       friction: 0
//     })
//   ],

//   material: new THREE.MeshPhongMaterial({
//     color: UTILS.$colors.mesh
//   }),

//   position: [0, 30, 0]
// });

const ball = new WHS.Icosahedron({
  geometry: {
    radius: 20,
    detail: 1
  },

  modules: [
    // new PHYSICS.SphereModule({
    //   mass: 10,
    //   restitution: 3,
    //   friction: 1
    // }),
    new PHYSICS.ConvexModule({
      mass: 10,
      restitution: 3,
      friction: 1
    })
  ],

  material: new THREE.MeshNormalMaterial({
    shading: THREE.FlatShading
  }),

  position: [0, 30, 0]
});




// Create all sides of the box
function makeBoxWall(attrs = {}, size = 100) {
  return new WHS.Box({
    ...attrs,

    geometry: {
      width: size,
      height: size,
      depth: 0
    },

    shadow: {
      cast: false
    },

    modules: [
      new PHYSICS.BoxModule({
        mass: 100,
        restitution: 3,
        friction: 0
      })
    ],

    // material: new THREE.MeshPhongMaterial({
    //   color: 0x447F8B,
    //   transparent: true,
    //   opacity: 0.125
    // })
  });
}

// new WHS.Edges({
//   geometry: new THREE.BoxBufferGeometry( 100, 100, 100 ),

//   modules: [
//     new PHYSICS.BoxModule({
//       mass: 0,
//       restitution: 3,
//       friction: 0
//     })
//   ],

//   material: new THREE.LineBasicMaterial( { color: 0xffffff } ),
// }).addTo(world);


// Create wireframe box
const box = new WHS.Box({
  geometry: {
    width: 100,
    height: 100,
    depth: 100
  },

  shadow: {
    cast: false
  },

  modules: [
    new PHYSICS.CompoundModule({
      mass: 100
    })
  ],

  material: new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true
  }),

  position: [0, 0, 0],
  rotation: [0, 0, 0]
}).defer(box => {
  makeBoxWall({
    position: [0, 0, 50]
  }).addTo(box);

  makeBoxWall({
    position: [0, 0, -50]
  }).addTo(box);

  makeBoxWall({
    rotation: {x: -Math.PI / 2},
    position: [0, 50, 0]
  }).addTo(box);

  makeBoxWall({
    rotation: {x: -Math.PI / 2},
    position: [0, -50, 0]
  }).addTo(box);

  makeBoxWall({
    rotation: {y: -Math.PI / 2},
    position: [50, 0, 0]
  }).addTo(box);

  makeBoxWall({
    rotation: {y: -Math.PI / 2},
    position: [-50, 0, 0]
  }).addTo(box);

  box.addTo(world).then(() => {
    const v = new THREE.Vector3(0, 0, 1);

    box.setLinearFactor(new THREE.Vector3(0, 0, 0));

    new WHS.Loop(() => {
      box.setAngularVelocity(v);
    }).start(world);


    const mouse = new WHS.VirtualMouse(world);
    mouse.track(box);

    let gravity = true;
    let rotateLoop = new WHS.Loop();

    box.on('click', () => {
      if (gravity) {
        world.setGravity(new THREE.Vector3(0, 100, 0));

        rotateLoop.stop();
        rotateLoop = new WHS.Loop(() => {
          drape.rotation.z += 0.2;
          if (drape.rotation.z >= Math.PI) {
            rotateLoop.stop();
            drape.rotation.z = Math.PI;
          }
        })
        rotateLoop.start(world);
      } else {
        world.setGravity(new THREE.Vector3(0, -100, 0));

        rotateLoop.stop();
        rotateLoop = new WHS.Loop(() => {
          drape.rotation.z -= 0.2;
          if (drape.rotation.z <= 0) {
            rotateLoop.stop();
            drape.rotation.z = 0;
          }
        })
        rotateLoop.start(world);
      }
      gravity = !gravity
    });
  });
});


const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load(`${process.assetsPath}/textures/earth.jpg`);
const textureMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture } );


const drape = new WHS.Plane({
  geometry: {
    width: 1000,
    height: 1000
  },
  position: [0, 0, -200],
  material: textureMaterial
});


new WHS.PointLight({
  light: {
    intensity: 1,
    distance: 500
  },

  shadow: {
    fov: 100
  },

  position: [10, 10, 100]
})
.addTo(world);

new WHS.AmbientLight({
  light: {
    intensity: 0.5
  }
}).addTo(world);



// UTILS.addBasicLights(world);
ball.addTo(world);
drape.addTo(world);

world.start();


