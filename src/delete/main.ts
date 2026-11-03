import { API_BASE } from '../lib/api';

// The "delete my data" web page (delete.html): erases a learner by their backup code, without the app.
const form = document.querySelector<HTMLFormElement>('#form')!;
const input = document.querySelector<HTMLInputElement>('#code')!;
const button = document.querySelector<HTMLButtonElement>('#go')!;
const result = document.querySelector<HTMLParagraphElement>('#result')!;

const show = (text: string, state: 'done' | 'error') => {
  result.textContent = text;
  result.className = `is-${state}`;
};

input.addEventListener('input', () => {
  input.value = input.value.toUpperCase();
  button.disabled = input.value.replace(/[^A-Z0-9]/g, '').length !== 10;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!confirm('সব তথ্য মুছে ফেলবে? এটা আর ফেরানো যাবে না।')) return;
  button.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/delete-by-code`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: input.value }),
    });
    if (res.ok) {
      show('মুছে ফেলা হয়েছে। তোমার কোনো তথ্য আর আমাদের কাছে নেই।', 'done');
      form.remove();
      return;
    }
    show(res.status === 404 ? 'এই কোডটা মিলল না। অক্ষরগুলো আরেকবার দেখে নাও।' : res.status === 429 ? 'অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করো।' : 'কিছু একটা গোলমাল হলো। পরে আবার চেষ্টা করো।', 'error');
  } catch {
    show('সার্ভারে পৌঁছানো গেল না। ইন্টারনেট চালু করে আবার চেষ্টা করো।', 'error');
  }
  button.disabled = false;
});
