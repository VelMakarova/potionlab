const loads = new Map<string, Promise<boolean>>();
// Bound waits include decoding. A stalled asset must not leave the application behind a loader forever.
export function preloadImage(url: string): Promise<boolean> {
  const cached = loads.get(url);

  if (cached) return cached;

  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (success: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(success);
    };
    const timer = setTimeout(() => finish(false), 15000);
    img.onerror = () => finish(false);
    img.onload = () => {
      if (typeof img.decode === "function")
        img.decode().then(
          () => finish(true),
          () => finish(false),
        );
      else finish(true);
    };
    img.src = url;
  });

  loads.set(url, promise);

  void promise.then((success) => {
    if (!success) loads.delete(url);
  });

  return promise;
}
