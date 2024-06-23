const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = function watchTargetImagesFolder() {
    const folderPath = path.join(__dirname, '../public/target_images');
    const scriptPath = path.join(__dirname, '../Inference/app/main.py');

    const watcher = chokidar.watch(folderPath, {
        ignored: /^\./, 
        persistent: true 
    });

    console.log(`Watching ${folderPath} for changes...`);

    watcher.on('add', (filePath) => {
        console.log(`New file added: ${filePath}`);
        executePythonScript(filePath, scriptPath);
    });

    watcher.on('error', (error) => console.error(`Watcher error: ${error}`));

    function executePythonScript(imagePath, scriptPath) { 
        const command = `python "${scriptPath}" "${imagePath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                return;
            }

            console.log('Python script output:', stdout);

            try {
                const classificationResults = JSON.parse(stdout);
                saveClassifiedResults(imagePath, classificationResults);
            } catch (parseError) {
                console.error(`Error parsing Python output: ${parseError}`);
            }
        });
    }

    function saveClassifiedResults(imagePath, classificationResults) {
        const imageName = path.basename(imagePath, path.extname(imagePath));
        const resultFilePath = path.join(folderPath, `${imageName}_results.json`);
        const classifiedImagePath = path.join(folderPath, `${imageName}_classified.jpg`);

        fs.writeFileSync(resultFilePath, JSON.stringify(classificationResults, null, 4));
        fs.copyFileSync(imagePath, classifiedImagePath);

        console.log(`Classification results saved: ${resultFilePath}`);
        console.log(`Classified image saved: ${classifiedImagePath}`);
    }
};
