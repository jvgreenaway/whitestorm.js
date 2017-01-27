import * as UTILS from '../../globals';

const mouse = new WHS.app.VirtualMouseModule();

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
function boxWall(attrs = {}, size = 100) {
  return new WHS.Box({
    ...attrs,

    geometry: {
      width: size,
      height: size,
      depth: 0
    },

    shadow: {
      cast: false,
      receive: false
    },

    modules: [
      new PHYSICS.BoxModule({
        mass: 100,
      })
    ],

    material: new THREE.MeshNormalMaterial({
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.5
    }),
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
    cast: false,
    receive: false,
  },

  modules: [
    new PHYSICS.CompoundModule({
      mass: 100
    })
  ],

  position: [0, 0, 0],
  rotation: [0, Math.PI, 0]
}).defer(box => {

  const makeBoxWall = (...params) => boxWall(...params).addTo(box);

  makeBoxWall({
    position: [0, 0, 50]
  });

  makeBoxWall({
    position: [0, 0, -50]
  });

  makeBoxWall({
    rotation: {x: -Math.PI / 2},
    position: [0, 50, 0]
  });

  makeBoxWall({
    rotation: {x: -Math.PI / 2},
    position: [0, -50, 0]
  });

  makeBoxWall({
    rotation: {y: -Math.PI / 2},
    position: [50, 0, 0]
  });

  makeBoxWall({
    rotation: {y: -Math.PI / 2},
    position: [-50, 0, 0]
  });

  box.addTo(world).then(() => {
    mouse.track(box);

    box.setLinearFactor(new THREE.Vector3(0, 0, 0));
    box.setAngularFactor(new THREE.Vector3(0, 0, 0));

    const states = [];

    states.push(() => {
      // down
      world.setGravity(new THREE.Vector3(0, -200, 0));
    })

    states.push(() => {
      // left
      world.setGravity(new THREE.Vector3(-200, 0, 0));
    })

    states.push(() => {
      // up
      world.setGravity(new THREE.Vector3(0, 200, 0));
    })

    states.push(() => {
      // right
      world.setGravity(new THREE.Vector3(200, 0, 0));
    })

    let currentState = 0;
    states[currentState]();

    const cycleStates = () => {
      currentState++;
      if (currentState >= states.length) currentState = 0;
      states[currentState]();
    }

    // Click box to change state
    box.on('click', cycleStates)

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
    radius: 30,
    detail: 2
  },

  modules: [
    new PHYSICS.ConvexModule({
      mass: 10,
      restitution: 3,
      friction: 1
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
    distance: 1000
  },

  shadow: {
    fov: 500
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
