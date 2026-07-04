// ===== Pixel courtyard (Phaser) — M1 world only =====
// Canvas owns only tiles/sprites. All Vietnamese text stays in DOM.

(function (root) {
  const TILE = 16;
  const WORLD_W = 320;
  const WORLD_H = 240;
  const MAP_W = 20;
  const MAP_H = 15;
  const SPEED = 70;

  const ASSET = {
    field: "assets/ninja/tiles/TilesetField.png",
    floor: "assets/ninja/tiles/TilesetFloor.png",
    detail: "assets/ninja/tiles/TilesetFloorDetail.png",
    house: "assets/ninja/tiles/TilesetHouse.png",
    nature: "assets/ninja/tiles/TilesetNature.png",
    water: "assets/ninja/tiles/TilesetWater.png",
    element: "assets/ninja/tiles/TilesetElement.png",
    villager: "assets/ninja/chars/Villager/SpriteSheet.png",
    shadow: "assets/ninja/chars/Shadow.png",
    fog: "assets/ninja/fx/Fog.png",
  };

  const COLS = {
    field: 5,
    floor: 22,
    detail: 16,
    house: 33,
    nature: 24,
    water: 28,
    element: 16,
  };

  /*
   * Tile-index map — VERIFIED visually against numbered contact sheets (audit 2026-07-04).
   * (0-based sheet grid; gid = tileset.firstgid + y * columns + x)
   *
   * field (5 cols): rounded grass blobs per season; ONLY the blob center is a seamless fill.
   *   springGrass   (1,4)  · autumnGrass (1,1) · pinkGrass (1,10) · snowGrass (1,13) · darkGrass (1,7)
   * floor (22 cols): dirt path ON light grass bg (173,188,58 == field spring center — no seam).
   *   dirtBlob3x3   (0,7)..(2,9)   yard center dirt patch
   *   dirtV         (3,7) cap / (3,8) mid / (3,9) cap — 1-wide vertical strip
   *   dirtH         (0,10) cap / (1,10) mid / (2,10) cap — 1-wide horizontal strip
   * detail (16 cols): transparent overlays.
   *   grassTufts    (0..7,2) · flowers see nature row 11
   * house (33 cols):
   *   orangeHouse   (0,0) size 4x3 — roof rows 0-1, wall+door row 2
   *   torii         (0,5) size 2x2 — mountain-path gate
   * nature (24 cols):
   *   bushyTree2x2  (2,3) · pine2x3 (0,2) · bigTree3x3 (3,18) (canopy rows 0-1, trunk row 2)
   *   bush1x1       (0,0)/(1,0) · flowers (0,11) yellow,(4,11) red,(2,11) clover
   * water (28 cols): pond blobs on same light grass (no seam).
   *   pond3x3       (0,6)..(2,8)
   *   porchDeck     (3,12) size 4x2 — clean plank interior, no frame lines
   * element (16 cols):
   *   jar           (1,0) · stoneLantern (0,0) · benchLong (11,1)..(13,1)
   *   fenceRail     (10,2) post-L / (11,2) rail / (12,2) post-R
   */

  let game = null;
  let activeScene = null;

  function makeWorldScene(options) {
    return class WorldScene extends Phaser.Scene {
      constructor() {
        super("WorldScene");
        this.options = options || {};
        this.tilesets = {};
        this.layers = {};
        this.moveTarget = null;
        this.facing = "down";
      }

      preload() {
        Object.entries(ASSET).forEach(([key, path]) => {
          if (key === "villager") {
            this.load.spritesheet("px-" + key, path, { frameWidth: TILE, frameHeight: TILE });
          } else {
            this.load.image("px-" + key, path);
          }
        });
      }

      create() {
        activeScene = this;
        this.cameras.main.setBackgroundColor("#9fb58d");
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

        this.buildMap();
        this.buildAtmosphere();
        this.buildPlayer();
        this.bindInput();
      }

      buildMap() {
        const map = this.make.tilemap({
          tileWidth: TILE,
          tileHeight: TILE,
          width: MAP_W,
          height: MAP_H,
        });

        this.map = map;
        // Blank tilemaps do NOT auto-assign firstgid (defaults to 0 for every
        // tileset, making all gid ranges collide) — pass a cumulative base.
        let gidBase = 0;
        Object.keys(COLS).forEach(key => {
          const ts = map.addTilesetImage(key, "px-" + key, TILE, TILE, 0, 0, gidBase);
          this.tilesets[key] = ts;
          gidBase += ts.total;
        });
        const sets = Object.values(this.tilesets);

        this.layers.ground = map.createBlankLayer("ground", sets, 0, 0);
        this.layers.path = map.createBlankLayer("path", sets, 0, 0);
        this.layers.props = map.createBlankLayer("props", sets, 0, 0);
        this.layers.top = map.createBlankLayer("top", sets, 0, 0);
        this.layers.collision = map.createBlankLayer("collision", sets, 0, 0);

        this.layers.ground.setDepth(0);
        this.layers.path.setDepth(2);
        this.layers.props.setDepth(6);
        this.layers.top.setDepth(8);
        this.layers.collision.setVisible(false);

        this.paintGround();
        this.paintPath();
        this.paintCourtyard();
        this.paintCollision();
      }

      gid(set, x, y) {
        return this.tilesets[set].firstgid + y * COLS[set] + x;
      }

      put(layer, set, x, y, tx, ty) {
        layer.putTileAt(this.gid(set, tx, ty), x, y);
      }

      stamp(layer, set, dstX, dstY, srcX, srcY, w, h) {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            this.put(layer, set, dstX + x, dstY + y, srcX + x, srcY + y);
          }
        }
      }

      paintGround() {
        for (let y = 0; y < MAP_H; y++) {
          for (let x = 0; x < MAP_W; x++) {
            const alt = (x + y) % 3 === 0;
            this.put(this.layers.ground, "field", x, y, alt ? 4 : 3, 4);
          }
        }
      }

      paintPath() {
        const p = this.layers.path;

        // Yard-center dirt patch (floor blob 3x3, grass-edged, seamless on field grass).
        this.stamp(p, "floor", 5, 9, 0, 7, 3, 3);

        // Gate strip: 1-wide vertical dirt, col 3 rows 11-13 (cap/mid/cap).
        this.put(p, "floor", 3, 11, 3, 7);
        this.put(p, "floor", 3, 12, 3, 8);
        this.put(p, "floor", 3, 13, 3, 9);
        this.put(p, "floor", 4, 11, 1, 10);

        // Blob → porch walkway: 1-wide horizontal dirt, row 9 (cap/mid/mid/cap).
        this.put(p, "floor", 8, 9, 0, 10);
        this.put(p, "floor", 9, 9, 1, 10);
        this.put(p, "floor", 10, 9, 1, 10);
        this.put(p, "floor", 11, 9, 2, 10);
      }

      paintCourtyard() {
        const props = this.layers.props;
        const top = this.layers.top;

        // Mountain-edge trees and bamboo, leaving a top-left footpath gap.
        this.stamp(top, "nature", 0, 0, 0, 0, 2, 2);
        this.stamp(top, "nature", 3, 0, 1, 2, 3, 3);
        this.stamp(top, "nature", 7, 0, 16, 0, 2, 2);
        this.stamp(top, "nature", 10, 0, 18, 2, 3, 3);
        this.stamp(top, "nature", 15, 0, 21, 2, 3, 3);
        this.stamp(props, "nature", 0, 3, 8, 9, 4, 2);

        // House: tiled-roof variant (12,0) 4x3, walkable wooden porch below it.
        this.stamp(props, "house", 14, 4, 12, 0, 4, 3);
        for (let x = 12; x <= 17; x++) {
          const sx = x === 12 ? 4 : x === 17 ? 8 : 5 + (x % 3);
          this.put(props, "water", x, 7, sx, 12);
          this.put(props, "water", x, 8, sx, 15);
        }

        // Bottom fence: weathered wood stockade (house 10,5 cap-L / 11,5 run / 12,5 cap-R),
        // gate opening at cols 2-3.
        for (let x = 0; x < MAP_W; x++) {
          if (x === 2 || x === 3) continue;
          const sx = (x === 0 || x === 4) ? 10 : (x === 1 || x === MAP_W - 1) ? 12 : 11;
          this.put(props, "house", x, 13, sx, 5);
        }

        // Courtyard tree.
        this.stamp(top, "nature", 5, 6, 3, 18, 3, 3);

        // Jar near porch and a small pond tucked into the right/top garden.
        this.put(props, "element", 10, 6, 1, 0);
        this.stamp(props, "water", 10, 2, 0, 6, 3, 3);

        // Rocks and low plants break the yard edge.
        this.stamp(props, "nature", 14, 9, 14, 14, 4, 3);
        this.put(props, "nature", 3, 10, 3, 11);
        this.put(props, "nature", 4, 10, 6, 10);
        this.put(props, "nature", 9, 11, 10, 10);
      }

      paintCollision() {
        const c = this.layers.collision;
        const block = (x, y) => this.put(c, "field", x, y, 3, 4);

        // Top tree band, with a two-tile mountain-path gap.
        for (let y = 0; y <= 3; y++) {
          for (let x = 0; x < MAP_W; x++) {
            if ((x === 1 || x === 2) && y <= 3) continue;
            block(x, y);
          }
        }

        // House body; porch rows 7-8 remain walkable.
        for (let y = 4; y <= 6; y++) {
          for (let x = 14; x <= 17; x++) block(x, y);
        }

        // Fence, tree trunk, jar, pond, rocks.
        for (let x = 0; x < MAP_W; x++) {
          if (x === 2 || x === 3) continue;
          block(x, 13);
          block(x, 14);
        }
        [[6, 8], [6, 9], [7, 8], [10, 6], [10, 2], [11, 2], [12, 2], [10, 3], [11, 3], [12, 3], [14, 10], [15, 10], [16, 10], [17, 10]].forEach(([x, y]) => block(x, y));

        c.setCollisionByExclusion([-1]);
      }

      buildAtmosphere() {
        const fog = this.add.tileSprite(WORLD_W / 2, 36, WORLD_W, 64, "px-fog");
        fog.setAlpha(0.16).setDepth(12).setScrollFactor(0);
      }

      buildPlayer() {
        const startX = 13.2 * TILE;
        const startY = 7.8 * TILE;

        this.shadow = this.add.image(startX, startY + 7, "px-shadow");
        this.shadow.setDepth(28).setAlpha(0.72);

        this.player = this.physics.add.sprite(startX, startY, "px-villager", 0);
        this.player.setDepth(30);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(10, 8);
        this.player.body.setOffset(3, 8);

        this.createPlayerAnims();
        this.physics.add.collider(this.player, this.layers.collision, () => {
          if (this.moveTarget) this.moveTarget = null;
        });
      }

      createPlayerAnims() {
        // SpriteSheet frame math: column=facing (0 down, 1 up, 2 left, 3 right),
        // rows 0-3 are walk frames; frame index = row * 4 + facingColumn.
        const columns = { down: 0, up: 1, left: 2, right: 3 };
        Object.keys(columns).forEach(dir => {
          this.anims.create({
            key: "walk-" + dir,
            frames: [0, 1, 2, 3].map(row => ({ key: "px-villager", frame: row * 4 + columns[dir] })),
            frameRate: 8,
            repeat: -1,
          });
        });
      }

      bindInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
          W: Phaser.Input.Keyboard.KeyCodes.W,
          A: Phaser.Input.Keyboard.KeyCodes.A,
          S: Phaser.Input.Keyboard.KeyCodes.S,
          D: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.input.on("pointerdown", pointer => {
          const p = pointer.positionToCamera(this.cameras.main);
          this.moveTarget = {
            x: Phaser.Math.Clamp(p.x, 8, WORLD_W - 8),
            y: Phaser.Math.Clamp(p.y, 8, WORLD_H - 8),
          };
        });
      }

      update() {
        if (!this.player) return;

        const velocity = this.readMovement();
        this.player.setVelocity(velocity.x * SPEED, velocity.y * SPEED);

        if (velocity.x !== 0 || velocity.y !== 0) {
          this.facing = velocity.x < 0 ? "left" : velocity.x > 0 ? "right" : velocity.y < 0 ? "up" : "down";
          this.player.anims.play("walk-" + this.facing, true);
        } else {
          this.player.anims.stop();
          const idleFrame = { down: 0, up: 1, left: 2, right: 3 }[this.facing];
          this.player.setFrame(idleFrame);
        }

        this.shadow.setPosition(this.player.x, this.player.y + 7);
      }

      readMovement() {
        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const up = this.cursors.up.isDown || this.keys.W.isDown;
        const down = this.cursors.down.isDown || this.keys.S.isDown;

        let x = (right ? 1 : 0) - (left ? 1 : 0);
        let y = (down ? 1 : 0) - (up ? 1 : 0);

        if (x || y) {
          this.moveTarget = null;
          if (x) y = 0;
          return { x, y };
        }

        if (!this.moveTarget) return { x: 0, y: 0 };

        const dx = this.moveTarget.x - this.player.x;
        const dy = this.moveTarget.y - this.player.y;
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
          this.moveTarget = null;
          return { x: 0, y: 0 };
        }

        if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= 3) {
          return { x: Math.sign(dx), y: 0 };
        }
        if (Math.abs(dy) >= 3) {
          return { x: 0, y: Math.sign(dy) };
        }
        return { x: 0, y: 0 };
      }

      setDay() {
        // M1 uses spring skin only. This hook is here for later season updates.
      }
    };
  }

  function boot(parent, options) {
    if (game) game.destroy(true);
    parent.innerHTML = "";

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: WORLD_W,
      height: WORLD_H,
      zoom: 3,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: "#9fb58d",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: makeWorldScene(options),
    });

    return {
      setDay(data) {
        if (activeScene && activeScene.scene.isActive()) activeScene.setDay(data);
      },
      destroy() {
        if (game) game.destroy(true);
        game = null;
        activeScene = null;
      },
    };
  }

  root.TieuVienWorld = { boot };
})(window);
