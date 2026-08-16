<script setup>
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
} from '@vue-leaflet/vue-leaflet'

import 'leaflet/dist/leaflet.css'

let zoom = 10

const center = [43.6532, -79.3832]
</script>

<template>
  <div class="map-container">

    <LMap
      v-model:zoom="zoom"
      :center="center"
    >

      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />

      <LMarker :lat-lng="[43.6532, -79.3832]">

        <LPopup>
          <strong>Toronto</strong>
          <br>
          This is our first map marker.
        </LPopup>

      </LMarker>

    </LMap>

  </div>
</template>

<style scoped>
.map-container {
  height: 600px;
  width: 100%;
  padding: 5% 0;
}
</style>