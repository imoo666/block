import Phaser from 'phaser'
import { useEffect } from 'react'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'
import {
  BALL_SPEED,
  BLOCK_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  JOY_SIZE,
  PADDLE_SPEED
} from './constants'

const App = () => {
  useEffect(() => {
    // 配置项
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#f0f0f0',
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true // 碰撞箱辅助线
        }
      },
      plugins: {
        global: [
          {
            key: 'rexVirtualJoystick',
            plugin: VirtualJoystickPlugin,
            start: true
          }
        ]
      },
      disableContextMenu: true,
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    }
    // 激活
    const game = new Phaser.Game(config)
    // 加载图片
    function preload(this: Phaser.Scene) {
      // this.load.image('ball', './assets/ball.png')
      // this.load.image('paddle', '/assets/paddle.png')
      // this.load.image('brick', './assets/brick.png')
    }
    let ball: Phaser.Physics.Arcade.Image
    let paddle: Phaser.Physics.Arcade.Image
    let bricks: Phaser.Physics.Arcade.StaticGroup
    let score = 0
    let scoreText: Phaser.GameObjects.Text
    let joyStick: any = null
    //
    function create(this: Phaser.Scene) {
      // 创建摇杆
      joyStick = (this.plugins.get('rexVirtualJoystick') as any)?.add(this, {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: JOY_SIZE,
        base: this.add.circle(0, 0, JOY_SIZE, 0x888888),
        thumb: this.add.circle(0, 0, JOY_SIZE / 2, 0xcccccc)
      })

      // 创建球
      ball = this.physics.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, 'ball')
      ball.setCollideWorldBounds(true) // 世界边缘碰撞
      ball.setBounce(1, 1)
      ball.setVelocityY(BALL_SPEED)
      ball.body!.setCircle(ball.width / 2)
      ball.setMaxVelocity(BALL_SPEED)

      // 创建挡板
      paddle = this.physics.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT, 'paddle')
      paddle.setCollideWorldBounds(true) // 世界边缘碰撞
      paddle.setImmovable(true)
      paddle.body!.setCircle(paddle.width / 2)

      // 创建砖块
      bricks = this.physics.add.staticGroup({
        key: 'brick',
        repeat: Math.floor(CANVAS_WIDTH / 100),
        setXY: {
          x: BLOCK_WIDTH,
          y: 150,
          stepX: CANVAS_WIDTH / Math.floor(CANVAS_WIDTH / 100)
        }
      })
      // 将每个砖块转换为圆形
      bricks.children.iterate((brick: any): any => {
        if (brick.body) {
          brick.body.setCircle(BLOCK_WIDTH / 2)
        }
      })

      // 计分板
      scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px' })
      // 为球和砖块增加碰撞事件
      this.physics.add.collider(ball, paddle)
      this.physics.add.collider(ball, bricks, (_, brick) => {
        brick.destroy()
        score += 10
        scoreText.setText(`Score: ${score}`)
      })
    }
    // 动
    function update(this: Phaser.Scene) {
      // const cursors = this.input.keyboard?.createCursorKeys()
      const cursors = joyStick.createCursorKeys()
      if (!cursors) {
        return
      }
      if (cursors.left.isDown) {
        paddle.setVelocityX(-PADDLE_SPEED)
      } else if (cursors.right.isDown) {
        paddle.setVelocityX(PADDLE_SPEED)
      } else {
        paddle.setVelocityX(0)
      }
      if (ball.y >= CANVAS_HEIGHT - 20) {
        ball.setVelocity(0)
        // 显示失败消息
        this.add.text(200, 250, 'Game Over', { fontSize: '64px', color: '#FF0000' })
        ball.disableBody(true)
        // 重新开始游戏
        this.time.delayedCall(2000, () => {
          window.location.reload()
        })
      }
      if (bricks.countActive() === 0) {
        // 显示胜利消息
        this.add.text(200, 250, 'You Win!', { fontSize: '64px', color: '#00FF00' })
        ball.disableBody(true)
        // 重新开始游戏
        this.time.delayedCall(2000, () => {
          window.location.reload()
        })
      }
    }
    return () => {
      game.destroy(true, true)
    }
  }, [])
  return <div id="game-container"></div>
}
export default App
