<script lang="ts">
  import type { StatusBarItem } from "./Settings";
  import { MetricType, MetricCounter, BLANK_SB_ITEM, DEFAULT_SETTINGS } from "./Settings";
  import type BetterWordCount from "src/main";

  export let plugin: BetterWordCount;
  const { settings } = plugin;

  let statusItems: StatusBarItem[] = [...plugin.settings.statusBar];
  let altSItems: StatusBarItem[] = [...plugin.settings.altBar];

  function metricToString(metric: Metric): string {
    if (metric.type === MetricType.file) {
      switch (metric.counter) {
        case MetricCounter.words:
          return "Words in Note"
        case MetricCounter.characters:
          return "Chars in Note"
        case MetricCounter.sentences:
          return "Sentences in Note"
        case MetricCounter.pages:
          return "Pages in Note"
        case MetricCounter.files:
          return "Total Notes"
      }
    } else if (metric.type === MetricType.daily) {
      switch (metric.counter) {
        case MetricCounter.words:
          return "Daily Words"
        case MetricCounter.characters:
          return "Daily Chars"
        case MetricCounter.sentences:
          return "Daily Sentences" 
        case MetricCounter.pages:
          return "Daily Pages"
        case MetricCounter.files:
          return "Total Notes"
      }
    } else if (metric.type === MetricType.total) {
      switch (metric.counter) {
        case MetricCounter.words:
          return "Total Words"
        case MetricCounter.characters:
          return "Total Chars"
        case MetricCounter.sentences:
          return "Total Sentences"
        case MetricCounter.pages:
          return "Total Pages"
        case MetricCounter.files:
          return "Total Notes"
      }
    } else {
      return "Select Options"
    }
  }

  function swapStatusBarItems(i: number, j: number, arr: StatusBarItem[]) {
    const max = arr.length - 1;
    if (i < 0 || i > max || j < 0 || j > max) return arr;
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    return arr;
  }

  async function update(statusItems: StatusBarItem[]) {
    plugin.settings.statusBar = statusItems.filter((item) => {
      if (metricToString(item.metric) !== "Select Options") {
        return item;
      } 
    });

    await plugin.saveSettings();
  }

  async function updateAlt(altSItems: StatusBarItem[]) {
    plugin.settings.altBar = altSItems.filter((item) => {
      if (metricToString(item.metric) !== "Select Options") {
        return item;
      } 
    });

    await plugin.saveSettings();
  }
</script>

<div>
  <h4>Markdown Status Bar</h4>
  <p>Here you can customize what statistics are displayed on the status bar when editing a markdown note.</p>
  <div class="bwc-sb-buttons">
    <button
      aria-label="Add New Status Bar Item"
      on:click={async () => (statusItems = [...statusItems, JSON.parse(JSON.stringify(BLANK_SB_ITEM))])}
    >
      <div class="icon">
        Add Item
      </div>
    </button>
    <button
      aria-label="Reset Status Bar to Default"
      on:click={async () => {
      statusItems = [
    {
      prefix: "",
      suffix: " words",
      metric: {
        type: MetricType.file,
        counter: MetricCounter.words,
      },
    },
    {
      prefix: " ",
      suffix: " characters",
      metric: {
        type: MetricType.file,
        counter: MetricCounter.characters,
      },
    },
  ];
                await update(statusItems);
 }}
    >
      <div class="icon">
        Reset
      </div>
    </button>
  </div>
  {#each statusItems as item, i}
    <details class="bwc-sb-item-setting">
      <summary>
        <span class="bwc-sb-item-text">
          {metricToString(item.metric)}
        </span>
        <span class="bwc-sb-buttons">
          {#if i !== 0}
            <button
              aria-label="Move Status Bar Item Up"
              on:click={async () => {
                statusItems = swapStatusBarItems(i, i-1, statusItems);
                await update(statusItems);
              }}
            >
              ↑
            </button>
          {/if}
          {#if i !== statusItems.length - 1}
          <button
            aria-label="Move Status Bar Item Down"
            on:click={async () => {
              statusItems = swapStatusBarItems(i, i+1, statusItems);
              await update(statusItems);
            }}
          >
            ↓
          </button>
          {/if}
          <button
            aria-label="Remove Status Bar Item"
            on:click={async () => {
              statusItems = statusItems.filter((item, j) => i !== j);
              await update(statusItems);
            }}
          >
            X
          </button>
        </span>
      </summary>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Metric Counter</div>
          <div class="setting-item-description">
            Select the counter to display, e.g. words, characters.
          </div>
        </div>
        <div class="setting-item-control">
          <select 
            class="dropdown"
            value={item.metric.counter}
            on:change={async (e) => {
              const {value} = e.target;
              item.metric.counter = MetricCounter[MetricCounter[value]];
              await update(statusItems);
              await plugin.saveSettings();
            }}
          >
            <option value>Select Option</option>
            <option value={MetricCounter.words}>Words</option>
            <option value={MetricCounter.characters}>Characters</option>
            <option value={MetricCounter.sentences}>Sentences</option>
            <option value={MetricCounter.pages}>Pages</option>
            <option value={MetricCounter.files}>Files</option>
         </select>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Metric Type</div>
          <div class="setting-item-description">
            Select the type of metric that you want displayed.
          </div>
        </div>
        <div class="setting-item-control">
          <select 
            class="dropdown"
            value={item.metric.type}
            on:change={async (e) => {
              const {value} = e.target;
              item.metric.type = MetricType[MetricType[value]];
              await update(statusItems);
              await plugin.saveSettings();
            }}
          >
            <option value>Select Option</option>
              <option value={MetricType.file}>Current Note</option>
              <option value={MetricType.daily}>Daily Metric</option>
              <option value={MetricType.total}>Total in Vault</option>
         </select>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Prefix Text</div>
          <div class="setting-item-description">
            This is the text that is placed before the count.
          </div>
        </div>
        <div class="setting-item-control">
          <input 
            type="text"
            name="prefix"
            value={item.prefix}
            on:change={async (e) => {
              const { value } = e.target;
              item.prefix = value;
              await update(statusItems);
              await plugin.saveSettings();
            }}
            />
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Suffix Text</div>
          <div class="setting-item-description">
            This is the text that is placed after the count.
          </div>
        </div>
        <div class="setting-item-control">
          <input 
            type="text"
            name="suffix"
            value={item.suffix}
            on:change={async (e) => {
              const { value } = e.target;
              item.suffix = value;
              await update(statusItems);
              await plugin.saveSettings();
            }}
            />
        </div>
      </div>
    </details>
  {/each}
  <h4>Alternative Status Bar</h4>
  <p>Here you can customize what statistics are displayed on the status bar when not editing a markdown file.</p>
  <div class="bwc-sb-buttons">
    <button
      aria-label="Add New Status Bar Item"
      on:click={async () => (altSItems = [...altSItems, JSON.parse(JSON.stringify(BLANK_SB_ITEM))])}
    >
      <div class="icon">
        Add Item
      </div>
    </button>
    <button
      aria-label="Reset Status Bar to Default"
      on:click={async () => {
      altSItems = [
    {
      prefix: "",
      suffix: " files",
      metric: {
        type: MetricType.total,
        counter: MetricCounter.files,
      },
    },
  ];
                await update(statusItems);
 }}
    >
      <div class="icon">
        Reset
      </div>
    </button>
  </div>
  {#each altSItems as item, i}
    <details class="bwc-sb-item-setting">
      <summary>
        <span class="bwc-sb-item-text">
          {metricToString(item.metric)}
        </span>
        <span class="bwc-sb-buttons">
          {#if i !== 0}
            <button
              aria-label="Move Status Bar Item Up"
              on:click={async () => {
                altSItems = swapStatusBarItems(i, i-1, altSItems);
                await updateAlt(altSItems);
              }}
            >
              ↑
            </button>
          {/if}
          {#if i !== altSItems.length - 1}
          <button
            aria-label="Move Status Bar Item Down"
            on:click={async () => {
              altSItems = swapStatusBarItems(i, i+1, altSItems);
              await updateAlt(altSItems);
            }}
          >
            ↓
          </button>
          {/if}
          <button
            aria-label="Remove Status Bar Item"
            on:click={async () => {
              altSItems = altSItems.filter((item, j) => i !== j);
              await updateAlt(altSItems);
            }}
          >
            X
          </button>
        </span>
      </summary>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Metric Counter</div>
          <div class="setting-item-description">
            Select the counter to display, e.g. words, characters.
          </div>
        </div>
        <div class="setting-item-control">
          <select 
            class="dropdown"
            value={item.metric.counter}
            on:change={async (e) => {
              const {value} = e.target;
              item.metric.counter = MetricCounter[MetricCounter[value]];
              await updateAlt(altSItems);
              await plugin.saveSettings();
            }}
          >
            <option value>Select Option</option>
            <option value={MetricCounter.words}>Words</option>
            <option value={MetricCounter.characters}>Characters</option>
            <option value={MetricCounter.sentences}>Sentences</option>
            <option value={MetricCounter.pages}>Pages</option>
            <option value={MetricCounter.files}>Files</option>
         </select>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Metric Type</div>
          <div class="setting-item-description">
            Select the type of metric that you want displayed.
          </div>
        </div>
        <div class="setting-item-control">
          <select 
            class="dropdown"
            value={item.metric.type}
            on:change={async (e) => {
              const {value} = e.target;
              item.metric.type = MetricType[MetricType[value]];
              await updateAlt(altSItems);
              await plugin.saveSettings();
            }}
          >
            <option value>Select Option</option>
              <option value={MetricType.file}>Current Note</option>
              <option value={MetricType.daily}>Daily Metric</option>
              <option value={MetricType.total}>Total in Vault</option>
         </select>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Prefix Text</div>
          <div class="setting-item-description">
            This is the text that is placed before the count.
          </div>
        </div>
        <div class="setting-item-control">
          <input 
            type="text"
            name="prefix"
            value={item.prefix}
            on:change={async (e) => {
              const { value } = e.target;
              item.prefix = value;
              await updateAlt(altSItems);
              await plugin.saveSettings();
            }}
            />
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">Suffix Text</div>
          <div class="setting-item-description">
            This is the text that is placed after the count.
          </div>
        </div>
        <div class="setting-item-control">
          <input 
            type="text"
            name="suffix"
            value={item.suffix}
            on:change={async (e) => {
              const { value } = e.target;
              item.suffix = value;
              await updateAlt(altSItems);
              await plugin.saveSettings();
            }}
            />
        </div>
      </div>
    </details>
  {/each}
</div>
