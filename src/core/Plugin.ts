export interface PluginOptions {

   /** The item's tmdb id */
   tmdb?: number;

   /** The item's imdb id */
   imdb?: string;

   /** The movie's name or title */
   title: string;

   /** The tv's episode number */
   episode?: number;

   /** The tv's episode season number */
   season?: number;

   /** If the item is a tv-show or a movie */
   type?: "tv" | "movie"
};

export interface PluginSource {

   /** What the source is. */
   type: "video" | "html";

   /** The url pointing to the source */
   src: string;
}

export interface PluginResponse {

   /** The respon's title */
   title?: string;

   /** The media sources */
   sources: PluginSource[];
}

export class Plugin {

   public enabled: boolean = true;

   /** Will return an array of the sources found */
   public async find(options: PluginOptions): Promise<PluginResponse[]> {

      if ("episode" in options && typeof options.episode !== "number")
         throw new TypeError(`Plugin.find: episode property must be a number.`);

      if ("season" in options && typeof options.season !== "number")
         throw new TypeError(`Plugin.find: season property must be a number.`);

      if ("tmdb" in options && typeof options.tmdb !== "number")
         throw new TypeError(`Plugin.find: tmdb property must be a number.`);

      if ("imdb" in options && typeof options.imdb !== "string")
         throw new TypeError(`Plugin.find: imdb property must be a string.`)

      if ("title" in options && typeof options.title !== "string")
         throw new TypeError(`Plugin.find: title property must be a string.`)

      return [];
   }
}