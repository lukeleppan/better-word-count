<script lang="ts">
    import type { TAbstractFile } from "obsidian";
    import type BetterWordCount from "src/main";
    import {
        getAllFileContentInFolder,
        getAllFilesInFolder,
    } from "src/utils/FileUtils";
    import { ArcElement, Chart, PieController, Tooltip } from "chart.js";
    import { getWordCount } from "src/utils/StatUtils";
    // Enable minimal chart js
    Chart.register(ArcElement, PieController);
    Chart.register(Tooltip);

    export let file: TAbstractFile;
    export let plugin: BetterWordCount;

    let chartContainer: HTMLCanvasElement;

    // Function to map the word count of each file to a chart js data object
    const getFolderWordStats = async () => {
        // Get all files in the folder
        const allFiles = getAllFilesInFolder(plugin, file.path);

        // Get the content of all files in the folder
        const content = await getAllFileContentInFolder(allFiles);

        // Get the word count of all files in the folder
        const wordCounts = content.map((c) => getWordCount(c));

        return {
            labels: allFiles.map((file) => file.name),
            datasets: [
                {
                    label: "Word Count",
                    data: wordCounts,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };

    // Function to get all the data and render the chart
    async function renderChart(): Promise<number> {
        const options = {
            title: {
                display: true,
                text: "All Files and there Word Count",
                position: "top",
            },
            rotation: -0.7 * Math.PI,
            legend: {
                display: false,
            },
        };
        const data = await getFolderWordStats();

        new Chart(chartContainer, {
            type: "pie",
            data: data,
            options: options,
        });

        return data.datasets[0].data.reduce(
            (acc, current) => (acc += current),
            0
        );
    }
</script>

<div>
    <h1>{file.name}</h1>

    {#await renderChart()}
        <p>Counting</p>
    {:then data}
        <p>Total: {data} words</p>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}

    <canvas class="pieChart" bind:this={chartContainer} />
</div>
