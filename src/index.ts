import { Plugin } from "./core/Plugin";

/** The class that stores all of the plusings */
export default class PluginResgistry extends Map<string, Plugin> {

   /** Returns an array of all of the registered plugins */
   public get all(): Plugin[] {

      /** Turns the map into an entry array and gets the value from each */
      return Array.from(this).map(entry => entry[1])
   }
}