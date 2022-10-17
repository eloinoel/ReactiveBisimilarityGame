<h1> Reactive Bisimilarity Game </h1>

This project is part of a bachelor's thesis. The aim is to build a video game that plants the seed of intuition for the rather complex concept of reactive bisimilarity in players. Reactive bisimilarity is a semantic notion of equivalence for labelled transition systems (LTS) with timeouts, which represent how processes behave in a specific environment and how they interact with each other. The behaviour of processes can be compared to assert whether they act identical. For this, many different notions of equivalence exist in theoretical computer science, reactive bisimilarity being one of them. Other popular examples are "Trace equivalence", "Simulation" and "Bisimulation".`<h2 >`

<br>
  Get the Game
  <br>
  <br>
  <a href="https://github.com/geocine/phaser3-rollup-typescript#readme"><img src="https://i.imgur.com/6lcIxDs.png" alt="header" width="600"/></a>

</h2>

This is a [Phaser 3](https://github.com/photonstorm/phaser) project with [TypeScript](https://www.typescriptlang.org/), [Rollup](https://rollupjs.org) with ⚡️ lightning fast HMR through [Vite](https://vitejs.dev/).

You can play the game at: [https://eloinoel.github.io/ReactiveBisimilarityGame/](https://eloinoel.github.io/ReactiveBisimilarityGame/) or download this repository (see commands below).

### Available Commands

| Command          | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `yarn install` | Install project dependencies                             |
| `yarn dev`     | Builds project and open web server, watching for changes |
| `yarn build`   | Builds code bundle with production settings              |
| `yarn serve`   | Run a web server to serve built code bundle              |

### Development

After cloning the repo, run `yarn install` from your project directory. Then, you can start the local development
server by running `yarn dev` and navigate to http://localhost:3000.

### Production

After running `yarn build`, the files you need for production will be on the `dist` folder. To test code on your `dist` folder, run `yarn serve` and navigate to http://localhost:5000

