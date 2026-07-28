import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("입주비용 계산기 화면을 서버 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /입주 전에, 필요한 현금을/);
  assert.match(html, /총 계약금액/);
  assert.match(html, /367,290,000원/);
  assert.match(html, /현재 입력 기준 준비 현금/);
  assert.match(html, /예시 단지에서 선택/);
  assert.match(html, /주택형/);
  assert.match(html, /기준층/);
  assert.match(html, /현재까지 납부한 옵션비/);
  assert.doesNotMatch(html, /예정 잔금/);
  assert.match(html, /중도금 납부 상태/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="interim-payment-panel"/);
  assert.match(html, /id="interim-payment-panel"/);
  assert.match(html, /중도금 대출 상환 예정 원금/);
  assert.match(html, /취득세율이 입력되지 않아/);
  assert.match(html, /잔금대출 예정금액이 입력되지 않아/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
