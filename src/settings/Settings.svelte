<script lang="ts">
  import type BWCPlugin from '../main';
  import GeneralTab from './components/general-tab.svelte';
  import StatusBarTab from './components/status-bar-tab.svelte';
  export let plugin: BWCPlugin;
  
  let settings = plugin.getData().settings;  

  let activeTabValue = 1;
  let tabs = [
    {
      name: 'General',
      value: 1,
      component: GeneralTab,
    },
    {
      name: 'Status Bars',
      value: 2,
      component: StatusBarTab,
    },
  ];

  const handleClick = (tabValue: number) => () => (activeTabValue = tabValue);
</script>

<h1>Better Word Count</h1>

<ul>
  {#each tabs as tab}
    <li class={activeTabValue === tab.value ? 'active' : ''}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span on:click={handleClick(tab.value)}>{tab.name}</span>
    </li>
  {/each}
</ul>
  
{#each tabs as tab}
  {#if activeTabValue === tab.value}
    <svelte:component this={tab.component} />
  {/if}
{/each}


