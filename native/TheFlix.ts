import { Plugin, PluginOptions, PluginResponse } from "../src/core/Plugin";

/**
 * Getting sources from https://www.theflix.to/
 * @author Hoodgail Benjamin
 */
export default class TheFlixSource extends Plugin {

   /**
    * The website's api next build id
    * @deprecated fall back to scraping
    */
   public build: string = null;

   /**
    * The website's origin url
    */
   public origin: string = "https://www.theflix.to";

   /** Creates the type path for the item type */
   private getType(options: PluginOptions) {
      return options.type == "tv" ? "tv-show" : options.type
   }

   /** 
    * Creates the slug path from the tmdb id and the title
    * It removes everything not a number or letter from the title
    * It replaces spaces to "-"
    */
   private getSlug(options: PluginOptions) {
      return options.tmdb + "-" + options.title.replace(/[^a-z0-9]+|\s+/gmi, " ").replace(/\s+/g, '-').toLowerCase();
   }

   /** Creates the path with the season and episode number information */
   private getShow(options: PluginOptions) {
      return options.type == "tv" ? `season-${options.season}/episode-${options.episode}` : ""
   }

   public async find(options: PluginOptions): Promise<PluginResponse[]> {

      super.find(options);

      let url = new URL(this.origin)
      let type = this.getType(options);
      let slug = this.getSlug(options);
      let show = this.getShow(options);

      url.pathname = `/${type}/${slug}/${show}`;

      url.searchParams.set("movieInfo", slug)

      /** Fetches the raw text data. */
      const text = await fetch(url.toString()).then((e: Response) => e.text());

      /** Parses the html text to a DOM document */
      const document = new DOMParser().parseFromString(text, "text/html")

      /** Gets all of the scripts from the document */
      const scripts = Array.from(document.querySelectorAll("script"));

      /** Finds the script containing the source cdn information */
      const prop = scripts.find(e => e.textContent.includes("theflixvd.b-cdn"))

      /** It did not find the script */
      if (!prop) return [];

      /** The whole js's text content is a valid json, so it parses it */
      const data = JSON.parse(prop.textContent);

      /** The video cdn url */
      const src: string = data.props.pageProps.videoUrl;

      return [{
         title: options.title,
         sources: [{
            type: "video",
            src: src
         }]
      }]
   }
}