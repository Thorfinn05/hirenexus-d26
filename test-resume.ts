import { fetchAndParseResumeUrl } from './src/ai/flows/fetch-and-parse-resume-url-flow';
import "dotenv/config";

async function main() {
    const res = await fetchAndParseResumeUrl({ resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" });
    console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
