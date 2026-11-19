# Unity packages

Guides and docs for my Unity packages, at **https://damyanlhr.github.io/packages/**.

Each package has a guide that teaches how it works, with figures you can play
with and the sources it builds on, and docs for installing it and looking up
its API. The packages themselves live in their own repositories, each linking
back to its pages here.

| Package                               | Guide                                                                  | Docs                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Volumetric Sky (`com.damyanlhr.sky`)  | [guide](https://damyanlhr.github.io/packages/sky/guide/)               | [docs](https://damyanlhr.github.io/packages/sky/docs/)               |
| Upscalers (`com.damyanlhr.upscalers`) | [guide](https://damyanlhr.github.io/packages/upscalers/guide/)         | [docs](https://damyanlhr.github.io/packages/upscalers/docs/)         |
| Terrain Rendering                     | [guide](https://damyanlhr.github.io/packages/terrain-rendering/guide/) | [docs](https://damyanlhr.github.io/packages/terrain-rendering/docs/) |
| Terrain Dressing                      | [guide](https://damyanlhr.github.io/packages/terrain-dressing/guide/)  | [docs](https://damyanlhr.github.io/packages/terrain-dressing/docs/)  |
| Water                                 | [guide](https://damyanlhr.github.io/packages/water/guide/)             | [docs](https://damyanlhr.github.io/packages/water/docs/)             |

More of my work: [damyanlhr.github.io](https://damyanlhr.github.io/).

## Working on the site

```sh
npm ci
npm run dev    # http://localhost:5173/packages/
```

`docs/AUTHORING.md` explains how to add a package and write its guide and docs.
Every push to `main` deploys.
