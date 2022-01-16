export const URLResolve = (href: string) => {

   /** Makes sure the url starts with https or http to avoid absolute url error */
   if (href.startsWith("//")) href = "https:" + href;

   return href;
}