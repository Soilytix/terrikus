// Tests read content synchronously, as the shell does once a chapter is in: load every chapter first.
import { LOADERS, loadChapters } from "../src/content/load";

await loadChapters(Object.keys(LOADERS));
