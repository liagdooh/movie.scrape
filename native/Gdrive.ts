import { Plugin, PluginOptions, PluginResponse } from "../src/core/Plugin";
import { URLResolve } from "../src/core/Util";

export class GdriveRefs {

   public static async SbPlay(href: string): Promise<string> {
      let url = new URL(URLResolve(href));

      /** Fetches the raw text data. */
      let text = await fetch(url.toString()).then((e: Response) => e.text());

      /** 
       * Removes the search params 
       * Because the same url will be used with different imformation
       */
      url.search = ""

      /** Parses the html text to a DOM document */
      const document = new DOMParser().parseFromString(text, "text/html")

      /** Gets the anchor with the download link */
      let a: HTMLAnchorElement = document.querySelector("table tbody tr a");

      if (a && a.getAttribute("onclick")) {

         /** 
          * The anchor has a function with its string arguments, it parses it.
          * funciton_name('CODE', 'MODE', 'HASH')
          */
         let match = a.getAttribute("onclick").match(/'([^']+)'/gm);

         if (match) {
            let [code, mode, hash] = match;

            url.searchParams.set("op", "download_orig")
            url.searchParams.set("id", code.replace(/'/gm, ""))
            url.searchParams.set("mode", mode.replace(/'/gm, ""))
            url.searchParams.set("hash", hash.replace(/'/gm, ""))
            url.pathname = '/dl';

            /** Fetches the raw text data. */
            let text = await fetch(url.toString()).then((e: Response) => e.text());

            /** Parses the html text to a DOM document */
            const document = new DOMParser().parseFromString(text, "text/html")

            /** Gets the anchor with the source and then returns its href attribute */
            let a = document.querySelector(".contentbox span a");
            if (a && a.getAttribute("href")) return a.getAttribute("href");
         }
      }

      return null;
   }

   /** Getting download links from vidembed */
   public static async Vidembed(href: string): Promise<string> {

      let url = new URL(URLResolve(href));
      url.pathname = "/download";

      /** Fetches the raw text data. */
      let text = await fetch(url.toString()).then((e: Response) => e.text());

      /** Parses the html text to a DOM document */
      const document = new DOMParser().parseFromString(text, "text/html")

      /** Get all anchor elements */
      let list = Array.from(document.querySelectorAll("a"))

      /** Gets the sbstream anchor */
      let sb = list.find(a => a.textContent.includes("StreamSB"));

      /** The DoomSream download link anchor */
      let dood = list.find(a => a.textContent.includes("DoodStream"));

      if (sb && sb.getAttribute('href'))
         return await GdriveRefs.SbPlay(sb.getAttribute('href'));

      return null
   }
}

/**
 * Getting sources from https://www.theflix.to/
 * @author Hoodgail Benjamin
 */
export default class Gdrive extends Plugin {

   /**
    * The website's origin url
    */
   public origin: string = "https://database.gdriveplayer.us";

   async find(options: PluginOptions): Promise<PluginResponse[]> {

      super.find(options)

      let url: URL;

      if (options.type == "movie") {

         /** The url for movies */
         url = new URL("https://database.gdriveplayer.us");
         url.pathname = "/player.php";
         url.searchParams.set("tmdb", options.tmdb.toString())

         //They have a differnt domain for tvshows 
      } else {
         if (!options.season || !options.episode) return []

         /** The url for movies */
         url = new URL("https://series.databasegdriveplayer.co");
         url.pathname = "/player.php";
         url.searchParams.set("type", "series")
         url.searchParams.set("tmdb", options.tmdb.toString())
         url.searchParams.set("season", options.season.toString())
         url.searchParams.set("episode", options.episode.toString())
      }

      /** Fetches the raw text data. */
      let text = await fetch(url.toString()).then((e: Response) => e.text());

      /** Parses the html text to a DOM document */
      const document = new DOMParser().parseFromString(text, "text/html")

      /** Gets all anchors from the server lists container */
      let list: HTMLAnchorElement[] = Array.from(document.querySelectorAll(".list-server-items a"));

      /** The anchor that contains "Mirror" in its text content */
      let vidembed = list.find(e => e.textContent.includes("Mirror"));

      //console.debug(list.length)

      if (vidembed) {
         let src = await GdriveRefs.Vidembed(vidembed.getAttribute("href"));
         if (src)
            return [{ title: options.title, sources: [{ type: "video", src: src }] }]
      }

      return []
   }


}