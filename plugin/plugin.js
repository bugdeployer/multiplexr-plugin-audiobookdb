const PLUGIN_ID = 'com.bugdeployer.audiobookdb';
/** @param {unknown} value @returns {Record<string, unknown>} */
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AppShell.PluginError('invalid_response');
  return /** @type {Record<string, unknown>} */ (value);
}
/** @param {unknown} value @param {number} maximum */
function text(value, maximum = 512) { return typeof value === 'string' ? value.trim().slice(0, maximum) : ''; }
/** @param {import('multiplexr_plugin_sdk').Request} request */
function multiplexrEntry(request) {
  return AppShell.definePlugin({
    'metadata.search': AppShell.contribution('metadata.provider', (params, host) => {
      if (params.kind !== 'audiobook') throw new AppShell.PluginError('unsupported_capability');
      const approval = host.call('settings.effective', { id: AppShell.namespacedId(PLUGIN_ID, 'integrationApproved'), lineage: [{ scope: 'app' }] });
      if (approval.value !== true) throw new AppShell.PluginError('permission_denied');
      if (params.cursor != null || params.query.trim().length < 3) throw new AppShell.PluginError('invalid_request');
      const response = AppShell.httpJson(host, 'https://audiobookdb.org/api/search', 'apiKey', {
        q: (params.query + ' ' + (params.creator ?? '')).trim(), type: 'books',
        includeFields: ['id', 'title', 'people', 'originalLanguage', 'originallyPublishedAt', 'series'],
      });
      if (!Array.isArray(response)) throw new AppShell.PluginError('invalid_response');
      const seen = new Set();
      const items = response.slice(0, 10).flatMap(raw => {
        const item = object(raw), title = text(item.title), id = text(item.id);
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || !title || seen.has(id)) return [];
        seen.add(id);
        const authors = Array.isArray(item.people) ? item.people.slice(0, 32).flatMap(rawPerson => {
          const person = object(rawPerson);
          if (text(object(person.role).name).toLowerCase() !== 'author') return [];
          const name = text(object(person.person).name, 256); return name ? [name] : [];
        }) : [];
        /** @type {import('multiplexr_plugin_sdk').MetadataFields} */
        const fields = { identifier: 'audiobookdb:' + id };
        const language = text(item.originalLanguage), date = text(item.originallyPublishedAt, 10);
        if (language) fields.language = language;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) fields.publicationDate = date;
        if (Array.isArray(item.series) && text(item.series[0])) fields.series = text(item.series[0]);
        return [{ id: AppShell.namespacedId(PLUGIN_ID, 'book.' + id), title, authors, fields }];
      });
      return AppShell.page(items);
    }, PLUGIN_ID),
  })(request);
}
