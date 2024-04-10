<script setup>
import maplibregl from 'maplibre-gl';
import { onBeforeMount, onMounted } from 'vue';
import 'maplibre-gl/dist/maplibre-gl.css';

import { ref, provide } from 'vue';

// STORES
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();
import { useMainStore } from '@/stores/MainStore.js';
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js';
const AddressStore = useAddressStore();

// COMPOSABLES
import useMapStyle from '@/composables/useMapStyle';
const { noMapStyle, pwdDrawnMapStyle, dorDrawnMapStyle, imageryMapStyle } = useMapStyle();
import useDataFetch from '@/composables/useDataFetch';
const { addressDataFetch } = useDataFetch();

// COMPONENTS
import Topic from '../components/Topic.vue';

import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

let map;
let addressMarker;

onMounted(() => {
  if (route.params.address) {
    inputAddress.value = route.params.address;
    handleAddressSearch();
  }

  map = new maplibregl.Map({
    container: 'map',
    style: pwdDrawnMapStyle,
    center: [-75.163471, 39.953338],
    zoom: 12,
    minZoom: 6,
    maxZoom: 17,
  });
  addressMarker = new maplibregl.Marker()
    .setLngLat([0, 0])
    .addTo(map);
  // map.addSource('drawn-base-map', {
  //   'type': 'raster',
  //   'tiles': ['https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}'],
  //   'tileSize': 256,
  // });
  // map.addLayer({
  //   id: 'drawn-base-map-raster',
  //   source: 'drawn-base-map',
  //   type: 'raster',
  // });
  // map.addSource('drawn-base-map-labels', {
  //   'type': 'raster',
  //   'tiles': ['https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}'],
  //   'tileSize': 256,
  // });
  // map.addLayer({
  //   id: 'drawn-base-map-labels-raster',
  //   source: 'drawn-base-map-labels',
  //   type: 'raster',
  // });
});

const topicStyles = {
  Property: pwdDrawnMapStyle,
  Deeds: dorDrawnMapStyle,
  'Licenses & Inspections': pwdDrawnMapStyle,
  Zoning: dorDrawnMapStyle,
  Voting: pwdDrawnMapStyle,
  'Nearby Activity': pwdDrawnMapStyle,
}

router.afterEach(async (to, from) => {
  console.log('router.afterEach, to.params.topic:', to.params.topic, 'to.params.address:', to.params.address);
  map.setStyle(topicStyles[to.params.topic]);
  MapStore.currentTopicMapStyle = topicStyles[to.params.topic];

  if (to.params.address !== from.params.address) {
    console.log('running if')
    addressDataLoadedFlag.value = false;

    // on submit, immediately call AIS and put the full value in the AddressStore
    await addressDataFetch(to.params.address);
    const currentAddress = AddressStore.addressData.features[0].properties.street_address;
    MainStore.setCurrentAddress(currentAddress);
    
    // set the addressDataLoadedFlag value to true
    addressDataLoadedFlag.value = true;
  }
  if (to.params.address) {
    const coordinates = AddressStore.addressData.features[0].geometry.coordinates;
    map.setCenter(coordinates);
    
    addressMarker.setLngLat(coordinates)
  }
})

const toggleImagery = () => {
  console.log('toggleImagery, map.getStyle:', map.getStyle());
  const style = map.getStyle();
  if (style.name === 'imageryMap') {
    map.setStyle(MapStore.currentTopicMapStyle);
  } else {
    map.setStyle(imageryMapStyle);
  }
}

const inputAddress = ref('');

const addressDataLoadedFlag = ref(false);
provide('addressDataLoadedFlagKey', addressDataLoadedFlag);

const handleAddressSearch = async () => {
  console.log('handleAddressSearch');
  // set address loaded to false
  addressDataLoadedFlag.value = false;
  // on a new address search, clear all of the loaded data sources
  // dataSourcesLoadedArray.value = [];

  // on submit, immediately call AIS and put the full value in the AddressStore
  await addressDataFetch(inputAddress.value);

  // set the addressDataLoadedFlag value to true
  addressDataLoadedFlag.value = true;

  // add the value for the street_address in the MainStore
  const currentAddress = AddressStore.addressData.features[0].properties.street_address;
  MainStore.setCurrentAddress(currentAddress);

  // set the last search method to address (the alternative will eventually be 'mapClick')
  MainStore.setLastSearchMethod('address');

  // if the address is found, push the address to the router
  if (currentAddress && route.params.topic) {
    router.push({ name: 'address-and-topic', params: { address: currentAddress, topic: route.params.topic } });
  } else if (currentAddress) {
    router.push({ name: 'address-and-topic', params: { address: currentAddress, topic: 'Property' } });
  }
}


</script>

<template>
  <main>
    <div class="columns">
      <div id="topic-panel" class="column is-6">
        <!-- TOPIC PANEL ON LEFT -->
        <div class="column is-6">
          <div class="columns">
            <div class="column is-10">
              <input
                class="input"
                type="text"
                placeholder="Search an address"
                v-model="inputAddress"
              />
            </div>
            <button
              class="button"
              @click="handleAddressSearch"
            >
              Search
            </button>
          </div>
        </div>
        <button class="button" @click="toggleImagery">Toggle Imagery</button>
        <topic :topic-name="'Property'" />
        <topic :topic-name="'Deeds'" />
        <topic :topic-name="'Licenses & Inspections'" />
        <topic :topic-name="'Zoning'" />
        <topic :topic-name="'Voting'" />
        <topic :topic-name="'Nearby Activity'" />
      </div>



      <div id="map-panel" class="column is-6">
        <div id="map" class="map-class" />
      </div>
    </div>

    
  </main>
</template>

<style scoped>

.map-class {
  height: 100vh;
}

#topic-panel {
  padding: 2em;
}


</style>
