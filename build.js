const fs = require("fs-extra");
const path = require("path");
const { minify } = require("html-minifier-terser");

/* These constants are defining the directory names and file names used in the script. 
- `buildDir` specifies the directory where the built files will be stored.
- `sourceDir` specifies the directory where the source files are located.
- `assetsDir` specifies the directory where assets are stored within the `sourceDir`.
- `popupHtmlFile` specifies the filename for the popup HTML file.
- `manifestFile` specifies the filename for the manifest JSON file.
- `rulesFile` specifies the filename for the rules JSON file. */
const buildDir = "build";
const sourceDir = "src";
const assetsDir = "assets";
const popupHtmlFile = "popup.html";
const manifestFile = "manifest.json";

/* This block of code is responsible for copying assets from a source directory to a build directory
while filtering out CSS files. Here's a breakdown of what each part does: */
const assetsFromDir = path.resolve(__dirname, sourceDir, assetsDir);

const assetsToDir = path.resolve(__dirname, buildDir, assetsDir);
if (!fs.existsSync(assetsFromDir)) {
  console.log(`Directory not found : ${assetsFromDir}`);
  return;
}

fs.copySync(assetsFromDir, assetsToDir, { overwrite: true, filter: (src, dest) => !src.includes("css") });

/* This block of code is responsible for minifying the content of a popup HTML file. Here's a breakdown
of what each part does: */
const popupHtmlBuild = path.join(__dirname, buildDir, popupHtmlFile);
if (fs.existsSync(popupHtmlBuild)) fs.unlinkSync(popupHtmlBuild);

const popupHtmlSource = path.join(__dirname, sourceDir, popupHtmlFile);
if (!fs.existsSync(popupHtmlSource)) {
    console.log(`File not found : ${popupHtmlSource}`);
    return
}

const popupHtmlContent = fs.readFileSync(popupHtmlSource, "utf-8");

minify(popupHtmlContent, {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
}).then((minifiedHtml) => {
  fs.writeFileSync(popupHtmlBuild, minifiedHtml);
});

/* This block of code is responsible for handling the manifest file in the script. Here's a breakdown
of what each part does: */
const manifestBuild = path.join(__dirname, buildDir, manifestFile);
if (fs.existsSync(manifestBuild)) fs.unlinkSync(manifestBuild);

const manifestSource = path.join(__dirname, sourceDir, manifestFile);
if (!fs.existsSync(manifestSource)) {
    console.log(`File not found : ${manifestSource}`);
    return
}

const manifestContent = fs.readFileSync(manifestSource, "utf-8");
fs.writeFileSync(manifestBuild, JSON.stringify(JSON.parse(manifestContent)));