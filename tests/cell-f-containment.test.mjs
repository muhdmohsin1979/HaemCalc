import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const chromePath = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const reversalFile = process.env.REVERSAL_FILE || 'public/reversal.html';
const reversalUrl = pathToFileURL(resolve(reversalFile)).href;

let browser;

before(async () => {
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
});

after(async () => {
  await browser?.close();
});

async function renderScenario(values) {
  const page = await browser.newPage();
  try {
    await page.goto(reversalUrl);
    await page.evaluate((scenario) => {
      for (const [id, value] of Object.entries(scenario)) {
        const element = document.getElementById(id);
        if (!element) throw new Error(`Missing input: ${id}`);
        element.value = value;
      }
      document.getElementById('timing').dispatchEvent(
        new Event('change', { bubbles: true }),
      );
    }, values);
    return await page.locator('#output').innerText();
  } finally {
    await page.close();
  }
}

test('Cell F does not display the definitive no-reversal recommendation', async () => {
  const output = await renderScenario({
    anticoag: 'apixaban',
    bleed: 'ich_critical',
    timing: 'gt24',
    crcl: 'normal',
  });

  assert.doesNotMatch(output, /PCC (?:reversal )?not indicated/i);
});

test('Cell F does not display the unsupported residual concentration explanation', async () => {
  const output = await renderScenario({
    anticoag: 'apixaban',
    bleed: 'ich_critical',
    timing: 'gt24',
    crcl: 'normal',
  });

  assert.doesNotMatch(output, /residual drug level likely below/i);
  assert.doesNotMatch(output, /30 to 50 ng\/mL threshold/i);
});

test('Cell F displays the owner-approved interim escalation wording for every affected agent', async () => {
  for (const anticoag of ['apixaban', 'rivaroxaban', 'edoxaban']) {
    const output = await renderScenario({
      anticoag,
      bleed: 'ich_critical',
      timing: 'gt24',
      crcl: 'normal',
    });

    assert.match(output, /Urgent clinical assessment required/i);
    assert.match(output, /This calculator cannot determine from elapsed time and renal-function category alone whether clinically significant factor Xa inhibitor activity remains\./);
    assert.match(output, /For life-threatening or uncontrolled bleeding, urgently follow the current local major-haemorrhage or anticoagulant-reversal protocol and seek specialist haematology or thrombosis advice\./);
    assert.match(output, /Obtain a drug-specific anti-Xa level where available if this will not delay urgent management\./);
    assert.match(output, /Do not use this calculator output alone as a basis for withholding reversal or haemostatic treatment\./);
  }
});

test('Cell F does not retain the disputed consensus-practice classification', async () => {
  const output = await renderScenario({
    anticoag: 'apixaban',
    bleed: 'ich_critical',
    timing: 'gt24',
    crcl: 'normal',
  });

  assert.doesNotMatch(output, /Cell F:[^\n]*CONSENSUS PRACTICE/i);
});

test('representative unrelated reversal branches retain their existing outputs', async () => {
  const cellA = await renderScenario({
    anticoag: 'apixaban',
    bleed: 'ich_critical',
    timing: 'lt8',
    crcl: 'normal',
  });
  assert.match(cellA, /Cell A: life-threatening ICH\/retroperitoneal\/pericardial, within 8h/i);
  assert.match(cellA, /4F-PCC 50 IU\/kg/i);

  const cellG = await renderScenario({
    anticoag: 'rivaroxaban',
    bleed: 'ich_critical',
    timing: 'gt24',
    crcl: 'low',
  });
  assert.match(cellG, /Cell G: renal impairment, treat as if within 15 hours/i);
  assert.match(cellG, /4F-PCC 35 to 50 IU\/kg/i);

  const dabigatran = await renderScenario({
    anticoag: 'dabigatran',
    bleed: 'ich_critical',
    timing: 'gt24',
    crcl: 'normal',
  });
  assert.match(dabigatran, /Dabigatran pathway/i);
  assert.match(dabigatran, /Idarucizumab 5 g IV/i);
});
