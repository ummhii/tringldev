export const apiCache = {
  data: {},
  
  set(key, value, ttl = null) {
    this.data[key] = {
      value: value,
      timestamp: Date.now(),
      ttl: ttl
    };
  },
  
  get(key) {
    const cached = this.data[key];
    if (!cached) return null;
    
    if (cached.ttl && (Date.now() - cached.timestamp) > cached.ttl) {
      delete this.data[key];
      return null;
    }
    
    return cached.value;
  },
  
  has(key) {
    return this.get(key) !== null;
  },
  
  clear(key) {
    if (key) {
      delete this.data[key];
    } else {
      this.data = {};
    }
  }
};

export const imageCache = {
  images: new Map(),
  
  async set(url, blob) {
    try {
      const objectUrl = URL.createObjectURL(blob);
      this.images.set(url, objectUrl);
      return objectUrl;
    } catch (e) {
      console.error('Failed to cache image:', e);
      return url;
    }
  },
  
  get(url) {
    return this.images.get(url) || null;
  },
  
  has(url) {
    return this.images.has(url);
  },
  
  async load(url) {
    if (this.has(url)) {
      return this.get(url);
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      return await this.set(url, blob);
    } catch (e) {
      console.error('Failed to load and cache image:', e);
      return url;
    }
  },
  
  clear() {
    for (const objectUrl of this.images.values()) {
      if (objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    }
    this.images.clear();
  }
};
