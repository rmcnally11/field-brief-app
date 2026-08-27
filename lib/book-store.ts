"use client";

import { useEffect, useState } from "react";
import {
  BOOK_EVENT,
  BOOK_STORAGE_KEY,
  BOOK_UNLOCK_KEY,
  emptyBook,
  parseBook,
  type BookState,
  type CatchEntry,
} from "@/lib/book";

function read(): BookState {
  if (typeof window === "undefined") return emptyBook();
  try {
    const raw = window.localStorage.getItem(BOOK_STORAGE_KEY);
    return raw ? parseBook(JSON.parse(raw)) : emptyBook();
  } catch {
    return emptyBook();
  }
}

function write(state: BookState) {
  window.localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(BOOK_EVENT));
}

export function subscribeBook(listener: (state: BookState) => void) {
  const on = () => listener(read());
  window.addEventListener(BOOK_EVENT, on);
  window.addEventListener("storage", on);
  return () => {
    window.removeEventListener(BOOK_EVENT, on);
    window.removeEventListener("storage", on);
  };
}

export function useBook() {
  const [book, setBook] = useState<BookState>(emptyBook);
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const next = read();
    setBook(next);
    const open = sessionStorage.getItem(BOOK_UNLOCK_KEY);
    setUnlocked(!next.lockHash || open === next.lockHash);
    setReady(true);
    return subscribeBook((state) => {
      setBook(state);
      const still = sessionStorage.getItem(BOOK_UNLOCK_KEY);
      setUnlocked(!state.lockHash || still === state.lockHash);
    });
  }, []);

  function commit(next: BookState) {
    write(next);
    setBook(next);
  }

  function openBook(handle: string, lockHash: string | null) {
    const next = { ...read(), handle: handle.trim().slice(0, 32), lockHash };
    commit(next);
    if (lockHash) sessionStorage.setItem(BOOK_UNLOCK_KEY, lockHash);
    else sessionStorage.removeItem(BOOK_UNLOCK_KEY);
    setUnlocked(true);
  }

  function unlock(hash: string) {
    if (book.lockHash && hash === book.lockHash) {
      sessionStorage.setItem(BOOK_UNLOCK_KEY, hash);
      setUnlocked(true);
      return true;
    }
    return false;
  }

  function addCatch(entry: CatchEntry) {
    const cur = read();
    commit({ ...cur, catches: [entry, ...cur.catches] });
  }

  function removeCatch(id: string) {
    const cur = read();
    commit({ ...cur, catches: cur.catches.filter((c) => c.id !== id) });
  }

  function wipe() {
    sessionStorage.removeItem(BOOK_UNLOCK_KEY);
    commit(emptyBook());
    setUnlocked(false);
  }

  function replace(state: BookState) {
    commit(state);
    setUnlocked(!state.lockHash || sessionStorage.getItem(BOOK_UNLOCK_KEY) === state.lockHash);
  }

  return { book, ready, unlocked, openBook, unlock, addCatch, removeCatch, wipe, replace };
}
