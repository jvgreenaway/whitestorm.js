import * as UTILS from '../../globals';

const mouse = new WHS.app.VirtualMouseModule(world);

const world = new WHS.App([
  new WHS.app.ElementModule(),
  new WHS.app.SceneModule(),
  new WHS.app.CameraModule({
    position: new THREE.Vector3(0, 0, 200)
  }),
  new WHS.app.RenderingModule({
    bgColor: 0xFFFFFF,
    bgOpacity: 0,
    renderer: {
      alpha: true,
      antialias: true,
      shadowmap: {
        type: THREE.PCFSoftShadowMap
      }
    }
  }),
  new PHYSICS.WorldModule({
    ammo: process.ammoPath,
    gravity: new THREE.Vector3(0, -200, 0),
    softbody: true,
  }),
  new WHS.controls.OrbitModule(),
  new WHS.app.ResizeModule(),
  mouse
]);


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
        restitution: 0,
        friction: 0
      })
    ]
  });
}


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
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.5
  }),

  position: [0, 0, 0],
  rotation: [0, Math.PI, 0]
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
    box.setLinearFactor(new THREE.Vector3(0, 0, 0));
    box.setAngularFactor(new THREE.Vector3(0, 0, 0));

    function state0() {
      box.material = new THREE.MeshPhongMaterial({
        color: 0xf4ee42,
        transparent: true,
        opacity: 0.125
      })
      world.setGravity(new THREE.Vector3(0, -200, 0));
    }

    function state1() {
      box.material = new THREE.MeshPhongMaterial({
        color: 0xdc42f4,
        transparent: true,
        opacity: 0.125
      })
      world.setGravity(new THREE.Vector3(0, 200, 0));
    }

    function state2() {
      box.material = new THREE.MeshPhongMaterial({
        color: 0x65f442,
        transparent: true,
        opacity: 0.125
      })
      world.setGravity(new THREE.Vector3(200, 0, 0));
    }

    function state3() {
      box.material = new THREE.MeshPhongMaterial({
        color: 0xf4426e,
        transparent: true,
        opacity: 0.125
      })
      world.setGravity(new THREE.Vector3(-200, 0, 0));
    }

    state0();

    let state = 0

    mouse.track(box);

    box.on('click', () => {
      state++;
      if (state >= 4) state = 0;

      switch(state) {
        case 0: state0(); break;
        case 1: state1(); break;
        case 2: state2(); break;
        case 3: state3(); break;
      }
    })

    // Move box with mouse
    mouse.on('move', () => {
      box.rotation.x = -mouse.y
      box.rotation.y = mouse.x
      box.__dirtyRotation = true;
    });
  });
});


// Create a ball
new WHS.Icosahedron({
  geometry: {
    radius: 20,
    detail: 2
  },

  modules: [
    new PHYSICS.ConvexModule({
      mass: 10,
      restitution: 3,
      friction: 2
    }),
    // new PHYSICS.SoftbodyModule({
    //   mass: 10000,
    //   margin: 1,
    // }),
    // new PHYSICS.SphereModule({
    //   mass: 10,
    //   restitution: 2,
    //   friction: 2,
    //   // scale: new THREE.Vector3(2, 10, 1)
    // }),
  ],

  material: new THREE.MeshNormalMaterial({
    shading: THREE.FlatShading
  }),

  position: [0, 30, 0]
}).defer(ball => {
  ball.addTo(world);
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


world.start();
