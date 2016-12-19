#### 1.0.7 (2016-12-19)

##### Chores

* **package:**
  * Update dotest dev dep ([3145d1f9](https://github.com/fvdm/nodejs-piwik/commit/3145d1f9b37003f003d1b12aa842f66dcd725b18))
  * Replaced test runner and dev deps by dotest ([5d7431d1](https://github.com/fvdm/nodejs-piwik/commit/5d7431d16c157fad960e2d73d009698fe9814ea8))
  * update eslint to version 3.0.0 ([bcc7b032](https://github.com/fvdm/nodejs-piwik/commit/bcc7b032a749b147d30106fab413afe631689fdd))
  * update changelog ([9153234c](https://github.com/fvdm/nodejs-piwik/commit/9153234cf1559bb25938b55ec447db912d1b6b9c))
  * Add example.js ([76b0d71d](https://github.com/fvdm/nodejs-piwik/commit/76b0d71d30dee628b4ab4344a789e35749fc5109))
  * Removed unused optionalDependencies property ([f5ed513c](https://github.com/fvdm/nodejs-piwik/commit/f5ed513c8927c339823562293ac280da4c8b27d4))
  * update dependency versions ([9201b535](https://github.com/fvdm/nodejs-piwik/commit/9201b53564efdec3d10936ca2c050d1fe5e6e941))
  * update dotest to version 1.4.0 ([627b70b9](https://github.com/fvdm/nodejs-piwik/commit/627b70b9cf2f28b1521a34c8c6ec29d8d94167fd))
* **develop:**
  * Allow 500 lines on bitHound ([df83195a](https://github.com/fvdm/nodejs-piwik/commit/df83195a9c1cc1179c6736618561d3b84427f2d0))
  * Added gitignore config ([affc70c7](https://github.com/fvdm/nodejs-piwik/commit/affc70c7206ac92a6a4f70815fbf60719285d99a))
  * Added bitHound config ([8b8cc383](https://github.com/fvdm/nodejs-piwik/commit/8b8cc3834fec36461dd329e88df79210fdb1a8dc))

##### Documentation Changes

* **badges:**
  * Added bitHound code quality ([ed4eae02](https://github.com/fvdm/nodejs-piwik/commit/ed4eae02850fc13d8a7c10527879ba999129ca78))
  * Added Coveralls badge ([bb34f8bd](https://github.com/fvdm/nodejs-piwik/commit/bb34f8bd2b03b7a3ca31a7904fa48a66680de03f))
  * Replaced Gemnasium with bitHound deps ([1e34e78e](https://github.com/fvdm/nodejs-piwik/commit/1e34e78eb6e541236bcaa62427e9f6de60693fa3))
* **readme:**
  * Add version badge for changelog ([5b13e6da](https://github.com/fvdm/nodejs-piwik/commit/5b13e6da3812c6d76c522a7b4fb81860ec409d81))
  * cleaner headings, code, author ([c1076c87](https://github.com/fvdm/nodejs-piwik/commit/c1076c874964caf63a4641d74119a119c873eb85))
  * Add Gemnasium dependencies badge ([0679f43e](https://github.com/fvdm/nodejs-piwik/commit/0679f43e6b23a786c569f60f804b4b1f9239bac6))

##### Bug Fixes

* **loadSpammers:** res is not available on error ([8d60828c](https://github.com/fvdm/nodejs-piwik/commit/8d60828c5de92593013937f6b853306e00b39780))
* **lint:** Removed extra spaces in example.js ([f0602ec6](https://github.com/fvdm/nodejs-piwik/commit/f0602ec60e3dc7f43161f15a4353fa1a3140a689))

##### Other Changes

* **undefined:** always run both test commands ([ac75ea2d](https://github.com/fvdm/nodejs-piwik/commit/ac75ea2d3635f778ba35dfa841a48b80b1df8691))

##### Refactors

* **loadSpammers:**
  * Cleaner empty line removal ([960a8316](https://github.com/fvdm/nodejs-piwik/commit/960a8316a2a598dbb43e1df8f686ef36653b7493))
  * Callback is not optional #24 ([e06cd547](https://github.com/fvdm/nodejs-piwik/commit/e06cd547ce0a0151bf8566f730ec703b04d20385))
* **errors:**
  * Moved tracking object conversion to function ([c6d041a1](https://github.com/fvdm/nodejs-piwik/commit/c6d041a13307621962c0b1cee388d26e120bca4e))
  * Moved error callbacks to function ([f892c5a2](https://github.com/fvdm/nodejs-piwik/commit/f892c5a2deb8db24e56fcec61d453dd39fe8a8e4))
* **package:**
  * Minimum supported node v4.0 ([01cc23de](https://github.com/fvdm/nodejs-piwik/commit/01cc23de15f5a5eb505b1a128d69f421cafc80f3))
  * Include UNLICENSE in package ([c9a49254](https://github.com/fvdm/nodejs-piwik/commit/c9a4925475b56d44fe0ec2da5c220003cc471873))
  * Add Tonic example ([7df96ecc](https://github.com/fvdm/nodejs-piwik/commit/7df96ecc9c02aeb84ca4c363f85e464fd1a6b245))
  * include CHANGELOG.md and example.js in package ([8b1052b8](https://github.com/fvdm/nodejs-piwik/commit/8b1052b85aba8f1d6e38358b4ff44821fd3da626))
* **processResponse:** Improved code readability ([4fc5d7b3](https://github.com/fvdm/nodejs-piwik/commit/4fc5d7b392df722c30589500a1602eb79eeec586))
* **talk:** Cleaner response handling ([cf2755f8](https://github.com/fvdm/nodejs-piwik/commit/cf2755f8cb1f577a2e2902b28f9cde874f32691c))

##### Code Style Changes

* **main:** Split long code lines ([4796127e](https://github.com/fvdm/nodejs-piwik/commit/4796127e55abf1004c6b8720428a4e6d3b343fbc))
* **syntax:**
  * No inline if-function calls #24 ([d0ec7d77](https://github.com/fvdm/nodejs-piwik/commit/d0ec7d77724d624ff09dd1268b5a7735bae393a9))
  * Removed unnecessary spaces ([9aea82e0](https://github.com/fvdm/nodejs-piwik/commit/9aea82e02882dc4369b830594de78f1ea7ec7466))
* **vars:** Renamed all cb to callback ([1120819d](https://github.com/fvdm/nodejs-piwik/commit/1120819d45dc9e9793ce30b136c7a7610f92eaba))

##### Tests

* **cleanup:**
  * Cleaner params in tests ([578c76b0](https://github.com/fvdm/nodejs-piwik/commit/578c76b0004a1d9fc8ab7c1e1001e6de7cd6e942))
  * Use new test() alias ([0e0c9a56](https://github.com/fvdm/nodejs-piwik/commit/0e0c9a56e63b1ea915a1698cb223e9c977f09831))
* **main:**
  * Added .track without token test ([6ce17014](https://github.com/fvdm/nodejs-piwik/commit/6ce170140ae9c9dbbe90fd1961f98f17e4ce277b))
  * Moved loadSpammers test above API error ([49ba801f](https://github.com/fvdm/nodejs-piwik/commit/49ba801fe0df87e9d65efc2b1631d394f6e7c896))
  * Moved API method test after API error ([5dfa99f1](https://github.com/fvdm/nodejs-piwik/commit/5dfa99f1232be9488d99d2d72cce316c5deb96b2))
  * Renamed Module test to Interface ([a218d916](https://github.com/fvdm/nodejs-piwik/commit/a218d91665a0d1f423ff1095e3f68e92e05f541f))
* **config:** Use dynamic node versions on Travis CI ([46e93846](https://github.com/fvdm/nodejs-piwik/commit/46e9384601f82bab674f0cd52bd954988ff3df83))
* **lint:** Update eslint to ES6 ([6d22c31b](https://github.com/fvdm/nodejs-piwik/commit/6d22c31b8e92bbc903cb8ce3efebc98f3f3e9d7c))
* **undefined:** add node v6 to Travis config ([4eacc566](https://github.com/fvdm/nodejs-piwik/commit/4eacc5662e5824a8bde97df3140931b64b3e287f))

#### 1.0.6 (2016-5-26)

##### Chores

* **package:**
  * Add example.js ([76b0d71d](https://github.com/fvdm/nodejs-piwik/commit/76b0d71d30dee628b4ab4344a789e35749fc5109))
  * Removed unused optionalDependencies property ([f5ed513c](https://github.com/fvdm/nodejs-piwik/commit/f5ed513c8927c339823562293ac280da4c8b27d4))
  * update dependency versions ([9201b535](https://github.com/fvdm/nodejs-piwik/commit/9201b53564efdec3d10936ca2c050d1fe5e6e941))
  * update dotest to version 1.4.0 ([627b70b9](https://github.com/fvdm/nodejs-piwik/commit/627b70b9cf2f28b1521a34c8c6ec29d8d94167fd))

##### Documentation Changes

* **readme:**
  * cleaner headings, code, author ([c1076c87](https://github.com/fvdm/nodejs-piwik/commit/c1076c874964caf63a4641d74119a119c873eb85))
  * Add Gemnasium dependencies badge ([0679f43e](https://github.com/fvdm/nodejs-piwik/commit/0679f43e6b23a786c569f60f804b4b1f9239bac6))

##### Bug Fixes

* **lint:** Removed extra spaces in example.js ([f0602ec6](https://github.com/fvdm/nodejs-piwik/commit/f0602ec60e3dc7f43161f15a4353fa1a3140a689))

##### Other Changes

* **undefined:**
  * add node v6 to Travis config ([4eacc566](https://github.com/fvdm/nodejs-piwik/commit/4eacc5662e5824a8bde97df3140931b64b3e287f))
  * always run both test commands ([ac75ea2d](https://github.com/fvdm/nodejs-piwik/commit/ac75ea2d3635f778ba35dfa841a48b80b1df8691))

##### Refactors

* **package:**
  * Add Tonic example ([7df96ecc](https://github.com/fvdm/nodejs-piwik/commit/7df96ecc9c02aeb84ca4c363f85e464fd1a6b245))
  * include CHANGELOG.md and example.js in package ([8b1052b8](https://github.com/fvdm/nodejs-piwik/commit/8b1052b85aba8f1d6e38358b4ff44821fd3da626))
* **processResponse:** Improved code readability ([4fc5d7b3](https://github.com/fvdm/nodejs-piwik/commit/4fc5d7b392df722c30589500a1602eb79eeec586))
* **talk:** Cleaner response handling ([cf2755f8](https://github.com/fvdm/nodejs-piwik/commit/cf2755f8cb1f577a2e2902b28f9cde874f32691c))

##### Tests

* **cleanup:** Use new test() alias ([0e0c9a56](https://github.com/fvdm/nodejs-piwik/commit/0e0c9a56e63b1ea915a1698cb223e9c977f09831))

