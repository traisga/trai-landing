// app/page.js
// Ana sayfa - TrAi uygulamasına yönlendir

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/trai.html');
}
