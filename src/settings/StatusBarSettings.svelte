<script lang="ts">
  import type { StatusBarItem } from "./Settings";
  import { Counter, BLANK_SB_ITEM } from "./Settings";
  import type BetterWordCount from "src/main";

  export let plugin: BetterWordCount;
  const { settings } = plugin;

  let statusItems: StatusBarItem[] = [...plugin.settings.statusBar];

  function counterToString(count: Counter): string {
    switch (count) {
      case Counter.fileWords:
        return "File Words";
      
      case Counter.fileChars:
        return "File Chars";

      case Counter.fileSentences:
        return "File Sentences";

      case Counter.totalWords:
        return "Total Words";

      case Counter.totalChars:
        return "Total Chars";

      case Counter.totalSentences:
        return "Total Sentences"

      case Counter.totalNotes:
        return "Total Notes";

      default:
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
      if (counterToString(item.count) !== "Select Options") {
        return item;
      } 
    });
    await plugin.saveSettings();
  }
</script>

<div>
  <div class="bwc-sb-buttons">
    <button
      aria-label="Add New Status Bar Item"
      on:click={async () => (statusItems = [...statusItems, Object.create(BLANK_SB_ITEM)])}
    >
      <div class="icon">
        Add Item
      </div>
    </button>
    <button
      aria-label="Reset Status Bar to Default"
      on:click={async () => {
      statusItems = [{
          prefix: "",
          suffix: " words",
          count: Counter.fileWords,
        },
        {
          prefix: " ",
          suffix: " characters",
          count: Counter.fileChars,
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
          {counterToString(item.count)}
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
          <div class="setting-item-name">Count Type</div>
          <div class="setting-item-description">
            This is the type of counter that will be displayed.
          </div>
        </div>
        <div class="setting-item-control">
          <select 
            class="dropdown"
            value={item.count}
            on:change={async (e) => {
              const {value} = e.target;
              item.count = Counter[Counter[value]];
              await update(statusItems);
              await plugin.saveSettings();
            }}
          >
            <option value>Select Option</option>
            <optgroup label="Words">
              <option value={Counter.fileWords}>{counterToString(Counter.fileWords)}</option>
              <option value={Counter.totalWords}>{counterToString(Counter.totalWords)}</option>
            </optgroup>
            <optgroup label="Characters">
              <option value={Counter.fileChars}>{counterToString(Counter.fileChars)}</option>
              <option value={Counter.totalChars}>{counterToString(Counter.totalChars)}</option>
            </optgroup>
            <optgroup label="Sentences">
              <option value={Counter.fileSentences}>{counterToString(Counter.fileSentences)}</option>
              <option value={Counter.totalSentences}>{counterToString(Counter.totalSentences)}</option>
            </optgroup>
            <optgroup label="Notes">
              <option value={Counter.totalNotes}>{counterToString(Counter.totalNotes)}</option>
            </optgroup>

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
</div>
