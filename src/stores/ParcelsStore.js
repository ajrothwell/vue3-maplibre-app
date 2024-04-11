
import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'
import axios from 'axios';

export const useParcelsStore = defineStore('ParcelsStore', {
  state: () => {
    return {
      PWD: {},
      DOR: {},
    };
  },
  actions: {
    async fillPwdParcelDataById() {
      const AddressStore = useAddressStore();
      const pwdParcelNumber = AddressStore.addressData.features[0].properties.pwd_parcel_id;
      const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0/query?where=PARCELID=%27${pwdParcelNumber}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
      this.PWD = await response.json()
    },

    async fillDorParcelDataById() {
      const AddressStore = useAddressStore();
      const dorParcelId = AddressStore.addressData.features[0].properties.dor_parcel_id;
      const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/DOR_Parcel/FeatureServer/0/query?where=MAPREG=%27${dorParcelId}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
      this.DOR = await response.json()
    },

    async fillParcelDataByLngLat(lng, lat, parcelLayer) {
      console.log('fillParcelDataByLngLat, lng:', lng, 'lat:', lat, 'parcelLayer:', parcelLayer);
      let ESRILayer = parcelLayer === 'PWD' ? 'PWD_PARCELS' : 'DOR_Parcel';
      let params = {
        'where': '1=1',
        'outSR': 4326,
        'f': 'geojson',
        'outFields': '*',
        'returnGeometry': true,
        'geometry': `{ "x": ${lng}, "y": ${lat}, "spatialReference":{ "wkid":4326 }}`,
        'geometryType': 'esriGeometryPoint',
        'spatialRel': 'esriSpatialRelWithin',
      };
      const response = await axios(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/${ESRILayer}/FeatureServer/0/query`, { params });
      console.log('response', response);
      this[parcelLayer] = response.data.features[0];
    },


  },
})