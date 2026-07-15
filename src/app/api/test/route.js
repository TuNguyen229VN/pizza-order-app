export async function POST(req) {
  console.log("TEST CALLBACK");
  console.log(await req.text());
  return new Response("ok");
}