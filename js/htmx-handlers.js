import { apiCache, imageCache } from './cache.js';
import { getTimeAgo } from './utils.js';

const NOW_PLAYING_CACHE_KEY = 'now-playing-data';
const NOW_PLAYING_TTL = 15000; // 15 seconds
const MUSIC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function storeMusicData(type, period, html) {
  try {
    const key = `lastfm-${type}-${period}`;
    const data = {
      html: html,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Failed to cache music data
  }
}

export function initHtmxHandlers() {
  document.body.addEventListener('htmx:beforeRequest', handleBeforeRequest);
  document.body.addEventListener('htmx:beforeSwap', handleBeforeSwap);
  document.body.addEventListener('htmx:responseError', handleResponseError);
}

function handleBeforeSwap(event) {
  const path = event.detail.requestConfig.path;
  const target = event.detail.target;
  const xhr = event.detail.xhr;
  
  const cacheKey = path;
  
  if (!xhr.responseText || xhr.status !== 200) {
    return;
  }
  
  try {
    if (path.includes('pinned-repo')) {
      const data = JSON.parse(xhr.responseText);
      const html = `
        <a href="${data.url}" class="terminal-link" target="_blank" rel="noopener noreferrer">
          ${data.name}
        </a>
        <p class="small">${data.description || 'No description available'}</p>
        ${data.language ? `<p class="small">Language: <span class="highlight">${data.language}</span></p>` : ''}
        <p class="small">${data.stars || 0} stars | ${data.forks || 0} forks</p>
        ${data.homepage ? `<p class="small"><a href="${data.homepage}" class="terminal-link" target="_blank" rel="noopener noreferrer">Homepage</a></p>` : ''}
        ${data.topics && data.topics.length > 0 ? `<div class="repo-topics">${data.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}</div>` : ''}
        ${data.updatedAt ? `<p class="small" style="color: var(--muted);">Updated: ${new Date(data.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>` : ''}
      `;
      target.innerHTML = html;
      apiCache.set(cacheKey, html);
      event.detail.shouldSwap = false;
    } else if (path.includes('/api/repo/') && !path.includes('pinned-repo')) {
      const data = JSON.parse(xhr.responseText);
      const topicsHtml = data.topics && data.topics.length > 0 
        ? `<div class="repo-topics">${data.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}</div>`
        : '';
      const updatedDate = data.updatedAt ? new Date(data.updatedAt).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : '';
      const html = `
        <a href="${data.url}" class="terminal-link" target="_blank" rel="noopener noreferrer">
          ${data.name}
        </a>
        <p class="small">${data.description || 'No description available'}</p>
        ${data.language ? `<p class="small">Language: <span class="highlight">${data.language}</span></p>` : ''}
        <p class="small">${data.stars || 0} stars | ${data.forks || 0} forks</p>
        ${topicsHtml}
        ${data.homepage ? `<p class="small"><a href="${data.homepage}" class="terminal-link" target="_blank" rel="noopener noreferrer">Homepage</a></p>` : ''}
        ${updatedDate ? `<p class="small" style="color: var(--muted);">Updated: ${updatedDate}</p>` : ''}
      `;
      target.innerHTML = html;
      apiCache.set(cacheKey, html);
      event.detail.shouldSwap = false;
    } else if (path.includes('now-playing')) {
      processNowPlaying(event, target);
      event.detail.shouldSwap = false;
    } else if (path.includes('top-artists')) {
      const data = JSON.parse(xhr.responseText);
      const html = data.artists && data.artists.length > 0 
        ? data.artists.map((artist, index) => `
            <div class="artist-item">
              <div class="artist-item-group-left">
                <span class="artist-rank">#${index + 1}</span>
                <span class="artist-name">${artist.name}</span>
              </div>
              <div class="artist-item-group-right">
                <span class="artist-plays">${artist.playcount} plays</span>
              </div>
            </div>
          `).join('')
        : `<p class="small" style="color: var(--muted);">No artist data available</p>`;
      target.innerHTML = html;
      
      const periodMatch = path.match(/period=([^&]+)/);
      if (periodMatch) {
        storeMusicData('artists', periodMatch[1], html);
      }
      
      event.detail.shouldSwap = false;
    } else if (path.includes('top-albums')) {
      const data = JSON.parse(xhr.responseText);
      const isMobile = window.innerWidth <= 768;
      const separator = isMobile ? '' : '- ';
      const html = data.albums && data.albums.length > 0 
        ? data.albums.map((album, index) => `
            <div class="artist-item">
              <div class="artist-item-group-left">
                <span class="artist-rank">#${index + 1}</span>
                <span class="artist-name">
                  <span class="track-name-part">${album.name} </span>
                  <span class="track-artist-part">${album.artist}</span>
                </span>
              </div>
              <div class="artist-item-group-right">
                <span class="artist-plays">${album.playcount} plays</span>
              </div>
            </div>
          `).join('')
        : `<p class="small" style="color: var(--muted);">No album data available</p>`;
      target.innerHTML = html;
      
      const periodMatch = path.match(/period=([^&]+)/);
      if (periodMatch) {
        storeMusicData('albums', periodMatch[1], html);
      }
      
      event.detail.shouldSwap = false;
    } 
    else if (path.includes('top-tracks')) {
      const data = JSON.parse(xhr.responseText);
      const isMobile = window.innerWidth <= 768;
      const html = data.tracks && data.tracks.length > 0 
        ? data.tracks.map((track, index) => `
            <div class="artist-item">
              <div class="artist-item-group-left">
                <span class="artist-rank">#${index + 1}</span>
                <span class="artist-name">
                  <span class="track-name-part">${track.name}</span>
                  <span class="track-artist-part">${track.artist}</span>
                </span>
              </div>
              <div class="artist-item-group-right">
                <span class="artist-plays">${track.playcount} plays</span>
              </div>
            </div>
          `).join('')
        : `<p class="small" style="color: var(--muted);">No track data available</p>`;
      target.innerHTML = html;
      
      const periodMatch = path.match(/period=([^&]+)/);
      if (periodMatch) {
        storeMusicData('tracks', periodMatch[1], html);
      }
      
      event.detail.shouldSwap = false;
    } else if (path.includes('recent-tracks')) {
      const data = JSON.parse(xhr.responseText);
      const isMobile = window.innerWidth <= 768;

      const hasNowPlaying = data.tracks && data.tracks.some(track => track.isPlaying);

      const tracksToDisplay = data.tracks && data.tracks.length > 0
        ? (hasNowPlaying ? data.tracks.slice(0, 10) : data.tracks)
          : [];

        const html = tracksToDisplay.length > 0
          ? tracksToDisplay.map((track, index) => {
            const playedDate = track.playedAt ? new Date(track.playedAt) : null;
            const timeAgo = playedDate ? getTimeAgo(playedDate) : '';
            const nowPlayingClass = track.isPlaying ? ' now-playing' : '';
            const audioBars = track.isPlaying ? '<span class="audio-bars"><span></span><span></span><span></span></span>' : '';
            return `
              <div class="artist-item${nowPlayingClass}">
                <div class="artist-item-group-left">
                  <span class="artist-rank">#${index + 1}</span>
                  <span class="artist-name">
                    <span class="track-name-part">${track.name}</span>
                    <span class="track-artist-part">${track.artist}</span>
                  </span>
                </div>
                <div class="artist-item-group-right">
                  <span class="artist-plays">${track.isPlaying ? audioBars + 'listening' : timeAgo}</span>
                </div>
              </div>
            `;
          }).join('')
        : `<p class="small" style="color: var(--muted);">No recent tracks available</p>`;
      target.innerHTML = html;
      apiCache.set(cacheKey, html);
      event.detail.shouldSwap = false;
    } else if (path.includes('/api/stats')) {
      const data = JSON.parse(xhr.responseText);
      const html = `
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Scrobbles:</span>
            <span class="stat-value highlight">${data.totalScrobbles || '0'}</span>
          </div>
        </div>
      `;
      target.innerHTML = html;
      apiCache.set(path, html);
      event.detail.shouldSwap = false;
    } else if (path.includes('/api/latest-post')) {
      const data = JSON.parse(xhr.responseText);
      const html = `
        <a href="${data.url}" class="terminal-link" target="_blank" rel="noopener noreferrer">
          ${data.title}
        </a>
        <p class="small">${new Date(data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      `;
      target.innerHTML = html;
      event.detail.shouldSwap = false;
    } else if (path.includes('/api/contact')) {
      event.detail.shouldSwap = false;
      handleContact(event);
    }
  } catch (e) {
    console.error('Error processing response:', e);
  }
}

function handleBeforeRequest(event) {
  const path = event.detail.requestConfig.path;
  
  if (path.includes('now-playing')) {
    const cachedData = apiCache.get(NOW_PLAYING_CACHE_KEY);
    if (cachedData) {
      event.preventDefault();
      const target = event.detail.target;
      renderNowPlaying(cachedData, target);
    }
    return;
  }
  
  if (path.includes('recent-tracks')) {
    return;
  }
  
  if (path.includes('top-artists') || path.includes('top-albums') || path.includes('top-tracks')) {
    return;
  }
  
  const cacheKey = path;
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData) {
    event.preventDefault();
    const target = event.detail.target;
    target.innerHTML = cachedData;
  }
}

async function renderNowPlaying(data, target) {
  const audioBars = document.getElementById('index-audio-bars');
  
  if (data.isPlaying) {
    if (audioBars) {
      audioBars.style.display = 'inline-flex';
    }
    
    const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23cba6f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M9 18V5l12-2v13"%3E%3C/path%3E%3Ccircle cx="6" cy="18" r="3"%3E%3C/circle%3E%3Ccircle cx="18" cy="16" r="3"%3E%3C/circle%3E%3C/svg%3E';
    const imageUrl = data.albumArt || placeholderSvg;
    
    const updateNowPlaying = (finalImageUrl) => {
      target.innerHTML = `
        <div class="now-playing-content">
          <img src="${finalImageUrl}" alt="Album art for ${data.albumName || data.songName}" class="album-art ${!data.albumArt ? 'placeholder' : ''}">
          <div class="song-details">
            <h3 class="highlight">${data.songName}</h3>
            <p class="small">by ${data.artistName}</p>
            ${data.albumName ? `<p class="small">from "${data.albumName}"</p>` : ''}
            ${data.songUrl ? `<a href="${data.songUrl}" class="terminal-link music-link" target="_blank" rel="noopener noreferrer">View on Last.fm →</a>` : ''}
          </div>
        </div>
      `;
    };
    
    if (!data.albumArt || imageUrl.startsWith('data:')) {
      updateNowPlaying(imageUrl);
    } else {
      try {
        const cachedUrl = await imageCache.load(imageUrl);
        updateNowPlaying(cachedUrl);
      } catch {
        target.innerHTML = `
          <div class="now-playing-content">
            <img src="${placeholderSvg}" alt="Album art for ${data.albumName || data.songName}" class="album-art placeholder">
            <div class="song-details">
              <h3 class="highlight">${data.songName}</h3>
              <p class="small">by ${data.artistName}</p>
              ${data.albumName ? `<p class="small">from "${data.albumName}"</p>` : ''}
              ${data.songUrl ? `<a href="${data.songUrl}" class="terminal-link music-link" target="_blank" rel="noopener noreferrer">View on Last.fm →</a>` : ''}
            </div>
          </div>
        `;
      }
    }
  } else {
    if (audioBars) {
      audioBars.style.display = 'none';
    }
    
    target.innerHTML = `<p class="small" style="color: var(--muted);">Not currently playing anything</p>`;
  }
}

function processNowPlaying(event, target) {
  try {
    const data = JSON.parse(event.detail.xhr.responseText);
    
    apiCache.set(NOW_PLAYING_CACHE_KEY, data, NOW_PLAYING_TTL);
    
    renderNowPlaying(data, target);
  } catch (e) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Failed to load music data</p>`;
    apiCache.clear(NOW_PLAYING_CACHE_KEY);
  }
}

function handleContact(event) {
  setTimeout(() => {
    const responseDiv = document.getElementById('contact-response');
    responseDiv.hidden = false;
    responseDiv.innerHTML = `
      <p style="color: var(--success);">
        ✓ Message sent successfully! I'll get back to you soon.
      </p>
    `;
    event.target.reset();
  }, 500);
}

function handleResponseError(event) {
  const target = event.detail.target;
  const path = event.detail.requestConfig.path;
  
  if (path.includes('pinned-repo') || (path.includes('/api/repo/') && !path.includes('pinned-repo'))) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch project data</p>`;
  } else if (path.includes('now-playing')) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch music data</p>`;
    apiCache.clear(NOW_PLAYING_CACHE_KEY);
  } else if (path.includes('top-artists')) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch top artists</p>`;
  } else if (path.includes('top-albums')) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch top albums</p>`;
  } else if (path.includes('top-tracks')) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch top tracks</p>`;
  } else if (path.includes('recent-tracks')) {
    target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch recent tracks</p>`;
  } else if (path.includes('/api/stats')) {
      target.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch stats</p>`;
  } else if (path.includes('/api/contact')) {
    const responseDiv = document.getElementById('contact-response');
    responseDiv.hidden = false;
    responseDiv.innerHTML = `
      <p style="color: var(--error);">
        ✗ Failed to send message. Please try again later.
      </p>
    `;
  }
}
