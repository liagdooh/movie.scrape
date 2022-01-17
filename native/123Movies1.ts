import { Plugin, PluginOptions, PluginResponse } from "../src/core/Plugin";

/**
 * Getting sources from https://ww1.123moviesfree.net/
 * @author Hoodgail Benjamin
 */
export default class I123Movies1 extends Plugin {

   /**
    * The website's origin url
    */
   public origin: string = "https://ww1.123moviesfree.net";

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

   formatQuery(options: PluginOptions) {

      return options.title.replace(/[^A-Z a-z]/gm, "")
   }

   public async find(options: PluginOptions): Promise<PluginResponse[]> {

      super.find(options);
      let url = new URL(this.origin)

      url.pathname = "/ajaxsearch2/search_suggestions/" + this.formatQuery(options) + ".html"

      /** Fetches the json data. */
      const json = await fetch(url.toString()).then((e: Response) => e.json());

      /** Parses the html text to a DOM document */
      const ul = new DOMParser().parseFromString(json.content, "text/html")

      const a = ul.querySelector("li > a");

      if (a && a.getAttribute("href")) {

         url.pathname = a.getAttribute("href") + "/watching.html";

         /** Fetches the raw text data. */
         const text = await fetch(url.toString()).then((e: Response) => e.text());

         /** Parses the html text to a DOM document */
         const document = new DOMParser().parseFromString(text, "text/html")

         const reg = /load_episode_video\('https:\/\/player\.voxzer\.org\/view\/([a-zA-Z0-9]+)'\)/;

         /** Gets all of the scripts from the document */
         const al = Array.from(document.querySelectorAll(".les-content a"))
            .find(a => reg.test(a.getAttribute("onclick")));

         if (al) {
            let [_, link] = al.getAttribute("onclick").match(/load_episode_video\('(.*)'\)/);

            let u = new URL(link);
            let id = u.pathname.split("/").pop();
            u.pathname = "/list/" + id;

            fetch(u.toString(), {
               headers: {
                  "content-type": "application/json",
                  "Content-Type": "application/json",
                  "contentType": "application/json"
               }
            }).then(e => e.text()).then(console.log)
         }
      }

      return []
   }
}