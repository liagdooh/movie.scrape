import I123Movies1 from "../native/123Movies1";
import Gdrive from "../native/Gdrive";
import TheFlix from "../native/TheFlix";
import { Plugin, PluginOptions, PluginResponse } from "./core/Plugin";

export interface NativePluginsMap {

   "gdrive": Gdrive,

   "flix": TheFlix,

   /** Custom ones */
   [name: string]: Plugin
}

export interface PluginResgistrySettings {

   /**
    * @default 4
    */
   limit: number,

   /**
    * @default 10
    */
   limitPlugins?: number
   filter?: string[];
};

/** The class that stores all of the plusings */
export default class PluginResgistry extends Map<string, NativePluginsMap[keyof NativePluginsMap]> {

   constructor() {
      super()

      this.set("1231", new I123Movies1);
      this.set("gdrive", new Gdrive);
      this.set("flix", new TheFlix);
   }

   /** Returns an array of all of the registered plugins */
   public get all(): [string, NativePluginsMap[keyof NativePluginsMap]][] {

      /** Turns the map into an entry array */
      return Array.from(this)
   }

   async find(options: PluginOptions, settings: PluginResgistrySettings): Promise<Array<(PluginResponse & { from: keyof NativePluginsMap })>> {

      let list: Array<(PluginResponse & { from: keyof NativePluginsMap })> = []

      let plugins = this.all

         //filters allowed plugins
         .filter(entry => settings.filter?.includes(entry[0]) !== false)

         //limits the amount of plugins to use, default is 10
         .slice(0, settings.limitPlugins || 10);

      let limit = settings.limit || 4;

      for (let [from, plugin] of plugins) {

         if (list.length >= limit)

            try {
               let sources = await plugin.find(options);
               for (let source of sources) list.push({ ...source, from })
            } catch (e) {
               console.log("PluginResgistry.find: Failed", from)
            }
      }

      return list.slice(0, limit);

   }
}