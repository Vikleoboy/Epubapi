const path = require("path");
const fs = require("fs");

const cheerio = require("cheerio");

const extract = require("extract-zip");

class Book {
  pth;
  des;
  Book;
  byZip;
  Cover;
  Name;
  Chapters;

  constructor(p, d, Zip = false) {
    this.pth = p;
    this.des = d;
    console.log(Zip);
    if (Zip) {
      this.byZip = true;
    } else {
      this.byZip = false;
    }
  }

  async sayhell() {
    console.log("HELLL ");
  }

  async init(fld) {
    let fileName = path.basename(this.pth);
    let isFile = await fs.statSync(this.pth);

    if (fileName.includes(".epub")) {
      let k = fileName.split(".");
      let copyfile = await fs.copyFileSync(
        this.pth,
        this.des + "\\" + k[0] + ".zip"
      );

      await extract(this.des + "\\" + k[0] + ".zip", {
        dir: this.des + "\\" + k[0],
      });
      await fs.unlinkSync(this.des + "\\" + k[0] + ".zip");
      return 1;
    } else {
      console.log("not an epubfile");
      return 0;
    }
  }
  async getCover(fld) {
    let fileName = path.basename(this.pth);
    let k;
    if (fld !== undefined) {
      k = [fld];
    } else {
      k = fileName.split(".");
    }

    let flds = await fs.readdirSync(this.des + "\\" + k[0]);

    let opPresent = true;

    for (let f of flds) {
      let know = await fs
        .lstatSync(this.des + "\\" + k[0] + "\\" + f)
        .isDirectory();

      if (f.includes("O") || (f.includes("o") && know)) {
        console.log("in the ops");
        opPresent = false;
        let book = await fs.readdirSync(this.des + "\\" + k[0] + "\\" + f);

        for (let i of book) {
          if (i.includes(".opf")) {
            let rd = await fs.readFileSync(
              this.des + "\\" + k[0] + "\\" + f + "\\" + i,
              "utf8"
            );
            const $ = cheerio.load(rd);
            const navContent = $('meta[name~="cover"]');
            const bookName = $("metadata").find("dc\\:title").text();

            console.log(bookName + "bkbkb");

            this.Name = bookName;
            console.log(navContent.attr("name"));

            let nm = navContent.attr("name");
            let cv = navContent.attr("content");

            if (nm === "cover") {
              let pic = $("#" + nm);
              let url = pic.attr("href");

              console.log(url);
              let realLink = this.des + "\\" + k[0] + "\\" + f + "\\" + url;
              this.Cover = realLink.replaceAll(/\\/g, "/");
              return url;
            }
          }
        }
      }
    }

    if (opPresent) {
      let book = await fs.readdirSync(this.des + "\\" + k[0]);

      for (let i of book) {
        if (i.includes(".opf")) {
          let rd = await fs.readFileSync(
            this.des + "\\" + k[0] + "\\" + i,
            "utf8"
          );
          const $ = cheerio.load(rd);
          const navContent = $('meta[name~="cover"]');
          const bookName = $("metadata").find("dc\\:title").text();

          console.log(bookName + "bkbkb");

          this.Name = bookName;

          console.log(navContent.attr("name"));

          let nm = navContent.attr("name");
          let cv = navContent.attr("content");

          if (nm === "cover") {
            let pic = $("#" + nm);
            let url = pic.attr("href");

            let realLink = this.des + "\\" + k[0] + "\\" + url;
            this.Cover = realLink.replaceAll(/\\/g, "/");
            return url;
          }
        }
      }
    }
  }
  async bookData(fld) {
    let fileName = path.basename(this.pth);
    let k;
    if (fld !== undefined) {
      k = [fld];
    } else {
      k = fileName.split(".");
    }
    let ifExists = await fs.existsSync(this.des + "\\" + k[0]);

    if (ifExists) {
      console.log(k);

      let flds = await fs.readdirSync(this.des + "\\" + k[0]);

      let opPresent = true;

      for (let f of flds) {
        let know = await fs
          .lstatSync(this.des + "\\" + k[0] + "\\" + f)
          .isDirectory();

        if (f.includes("O") || (f.includes("o") && know)) {
          opPresent = false;
          let book = await fs.readdirSync(this.des + "\\" + k[0] + "\\" + f);

          for (let i of book) {
            if (i.includes(".ncx")) {
              let rd = await fs.readFileSync(
                this.des + "\\" + k[0] + "\\" + f + "\\" + i,
                "utf8"
              );
              const $ = cheerio.load(rd);
              const navContent = $("navMap navPoint");

              let lessons = [];
              for (let p of navContent) {
                let point = $(p);

                let name = point.find("navLabel").text().replaceAll("  ", "");
                let link = point.find("content").attr("src");
                let realLink = this.des + "\\" + k[0] + "\\" + f + "\\" + link;
                lessons.push({
                  name: name.replaceAll(/\n/g, ""),
                  link: realLink.replaceAll(/\\/g, "/"),
                });
              }

              this.Chapters = lessons;
              return {
                Chapters: lessons,
              };
            }
          }
        }
      }

      if (opPresent) {
        let book = await fs.readdirSync(this.des + "\\" + k[0]);

        for (let i of book) {
          if (i.includes(".ncx")) {
            let rd = await fs.readFileSync(
              this.des + "\\" + k[0] + "\\" + "\\" + i,
              "utf8"
            );
            const $ = cheerio.load(rd);
            const navContent = $("navMap navPoint");

            let lessons = [];
            for (let p of navContent) {
              let point = $(p);

              let name = point.find("navLabel").text().replaceAll("  ", "");
              let link = point.find("content").attr("src");
              let realLink = this.des + "\\" + k[0] + "\\" + link;

              lessons.push({
                name: name.replaceAll(/\n/g, ""),
                link: realLink.replaceAll(/\\/g, "/"),
              });
            }

            this.Chapters = lessons;
            return {
              Chapters: lessons,
            };
          }
        }
      }
    }
  }

  saythings() {
    console.log(this.pth, this.des);
  }
}

let bk = new Book(
  "C:\\Users\\Vikleo\\Desktop\\book.epub",
  "C:\\Users\\Vikleo\\Desktop\\bk"
);

// let bk = new Book(
//   "C:\\Users\\Vikleo\\Desktop\\brianna-wiest-the-mountain-is-you-thought-catalog-books-2021.epub",
//   "C:\\Users\\Vikleo\\Desktop\\bk"
// );
// await bk.init();
async function somethign() {
  let y = await bk.init();

  let n = await bk.getCover("book");
  await bk.bookData("book");
  console.log(bk.Name, bk.Cover, " here", y);
}

somethign();
// await bk.bookData("book");

module.exports = Book;
