<template>
  <div class="head">
    <b class="label moreBtn">
      <i class="material-icons" style="padding-bottom: 2px; font-size: 18px"
        >expand_more</i
      >
      Project

      <div class="moreMenu">
        <div class="entry" @click="showShortcuts = true">Shortcuts</div>
        <div class="entry" @click="showDevMode = true">Dev-Mode</div>
        <div class="entry" @click="showAbout = true">About</div>
      </div>
    </b>
    <input
      class="inputProjectName"
      type="text"
      v-model="settings.projectName"
    />
    <div class="input">
      <b class="label">Width</b>
      <span><input type="number" v-model="settings.width" /> frames</span>
    </div>
    <div class="input">
      <b class="label">Height</b>
      <span><input type="number" v-model="settings.height" /> frames</span>
    </div>
    <div>
      <b class="label">ZOOM</b>
      <select v-model.number="settings.zoom">
        <option :value="settings.zoom" style="display: none"
          >x{{ settings.zoom }}</option
        >
        <option value="0.5">x0.5</option>
        <option value="1">x1</option>
        <option value="2">x2</option>
        <option value="4">x4</option>
      </select>
    </div>

    <div class="historyControls row">
      <div
        class="btn"
        :class="canUndo ? 'inactive' : ''"
        @click.prevent="$emit('undo')"
      >
        <span class="material-icons">undo</span>
        <span class="text">Undo</span>
      </div>
      <div
        class="btn"
        :class="canRedo ? '' : 'inactive'"
        @click.prevent="$emit('redo')"
      >
        <span class="material-icons">redo</span>
        <span class="text">Redo</span>
      </div>
    </div>

    <div class="btn import" @click="triggerImportSelector()">
      <span class="material-icons">cloud_upload</span>
      <span class="text">Import project</span>

      <div
        class="btn import secondary"
        @click.stop="triggerImportSelector(true)"
      >
        <span class="material-icons">extension</span>
        <span class="text">Import component</span>
      </div>
    </div>
    <div class="btn export" @click="$emit('export')">
      <span class="material-icons">get_app</span>
      <span class="text">Export savepoint</span>
    </div>
    <div class="btn export" @click="exportModal = true">
      <span class="material-icons">get_app</span>
      <span class="text">Export for usage</span>
    </div>

    <input
      type="file"
      ref="importFileSelect"
      accept=".json"
      style="display: none"
      @change="checkForUpload()"
    />

    <export-prompt
      v-model="exportModal"
      @export="exportProj($event)"
    ></export-prompt>
    <modal
      title="About this page"
      icon="help_outline"
      v-model="showAbout"
      closeBtn
    >
      <p>
        This is the AdvancedGUI web editor developed by
        <a href="https://leoko.dev/" target="_blank" rel="noopener noreferrer"
          >Leo Garbe</a
        >. <br />
        AdvancedGUI is a game extension for the sandbox video game Minecraft. It
        is available for purchase on
        <a
          href="https://www.spigotmc.org/resources/advancedgui-interactive-itemframe-guis.83636/"
          target="_blank"
          rel="noopener noreferrer"
          >SpigotMC</a
        >. <br />
        The code of this edtor is open-srouce on
        <a
          href="https://github.com/DevLeoko/AdvancedGUI-Web"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >. <br />
        For support join our
        <a
          href="https://discord.gg/ycDG6rS"
          target="_blank"
          rel="noopener noreferrer"
          >Discord</a
        >.
        <br />
        <br />
        Current format-version: {{ formatVersion }}
      </p>
    </modal>
    <modal title="Shortcuts" icon="keyboard" v-model="showShortcuts" closeBtn>
      <p class="shortcuts">
        <span>CTRL</span> <span>C</span> &ensp; Copy component <br />
        <span>CTRL</span> <span>V</span> &ensp; Paste component <br />
        <span>CTRL</span> <span>X</span> &ensp; Copy & delete component <br />
        <span>DELETE</span> &ensp; Delete component <br />
        <span>CTRL</span> <span>Z</span> &ensp; Undo <br />
        <span>CTRL</span> <span>Y</span> &ensp; Redo <br />
        <span>CTRL</span> <span>SCROLL</span> &ensp; Zoom in/out <br />
        <span>ARROW KEY</span> &ensp; Move component by 1 pixel <br />
        <span>SHIFT</span> <span>ARROW KEY</span> &ensp; Move component by 10
        pixel <br />
        <span>CTRL</span> <span>S</span> &ensp; Download savepoint <br />
      </p>
    </modal>
    <modal title="Dev-Mode" icon="code" v-model="showDevMode" closeBtn>
      <p>
        The AdvancedGUI web editor is designed to have a very intuitive user
        interface. But some users might require some more advanced features that
        would only confuse or dirsturb the average user. This is why we added
        <b>dev-mode</b>. <br />
        You can toggle the dev-mode by clicking on the
        <span
          class="material-icons"
          style="font-size:16px; vertical-align: middle;"
          >tune</span
        >-icon next to <i>"General setting"</i> in the left options tab.
        <br /><br />
        The dev-mode allows you to:
      </p>
      <ul>
        <li>Move component partially outside of the GUI view</li>
        <li>Change the ID of components</li>
        <li>Preview how the GUI will be divided into item-frames</li>
        <li>
          Set the direct RGBA color value of components (useful for using
          template variables for colors)
        </li>
      </ul>
    </modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { GeneralSettings } from "@/App.vue";

import { loading } from "@/components/LoadingScreen.vue";
import ExportPrompt from "@/components/ExportPrompt.vue";
import Modal from "@/components/Modal.vue";
import { VERSION } from "../utils/manager/UpdateManager";

export default defineComponent({
  props: {
    settings: {
      type: Object as () => GeneralSettings,
      required: true
    },
    canUndo: {
      type: Boolean
    },
    canRedo: {
      type: Boolean
    }
  },

  components: { ExportPrompt, Modal },

  data() {
    return {
      importComponent: false,
      exportModal: false,
      showAbout: false,
      showShortcuts: false,
      showDevMode: false,
      formatVersion: VERSION
    };
  },

  methods: {
    async checkForUpload() {
      const selector = this.$refs.importFileSelect as HTMLInputElement;

      if (selector.files?.length) {
        loading(true);
        const file = selector.files[0];
        const json = await file.text();
        this.$emit("load-project", JSON.parse(json), this.importComponent);
        selector.value = "";
      }
    },

    triggerImportSelector(componentMode = false) {
      this.importComponent = componentMode;
      (this.$refs.importFileSelect as HTMLElement).click();
    },

    exportProj(key: string) {
      this.exportModal = false;
      this.$emit("export-usage", key);
    }
  }
});
</script>

<style lang="scss" scoped>
.shortcuts {
  line-height: 2;

  span {
    font-size: 14px;
    background-color: $light4;
    padding: 2px 4px 0px;
    border-bottom: $light3 3px solid;
  }
}

.moreBtn {
  display: flex;
  align-items: center;
  position: relative;

  .moreMenu {
    top: 100%;
    position: absolute;
    display: none;
    flex-direction: column;
    background-color: $light4;
    box-shadow: $shadowStrong;
    padding-bottom: 1px;

    .entry {
      margin: 1px;
      margin-bottom: 0;
      padding: 4px 10px;
      font-size: 13px;
      background-color: $dark3;
      color: $light3;
      cursor: pointer;

      &:hover {
        background-color: $dark2;
        color: $light2;
      }
    }
  }

  &:hover .moreMenu {
    display: flex;
  }
}
</style>
