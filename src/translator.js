const https = require('https');
const querystring = require('querystring');

class BingTranslator {
    constructor() {
        this.globalConfig = null;
        this.configPromise = null;
        this.hostname = 'www.bing.com'; // Will be updated based on redirect
    }

    /**
     * Fetch global config from Bing Translator website
     */
    async fetchGlobalConfig() {
        return new Promise((resolve, reject) => {
            const fetchUrl = (url) => {
                https.get(url, (res) => {
                    // Handle redirects
                    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                        fetchUrl(res.headers.location);
                        return;
                    }

                    // Extract hostname from the final URL
                    const urlObj = new URL(url);
                    this.hostname = urlObj.hostname;

                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const igMatch = data.match(/IG:"([^"]+)"/);
                            const IG = igMatch ? igMatch[1] : null;

                            const iidMatch = data.match(/data-iid="([^"]+)"/);
                            const IID = iidMatch ? iidMatch[1] : null;

                            const paramsMatch = data.match(/params_AbusePreventionHelper\s*=\s*(\[[^\]]+\])/);
                            let key, token, tokenExpiryInterval;

                            if (paramsMatch) {
                                const params = JSON.parse(paramsMatch[1]);
                                [key, token, tokenExpiryInterval] = params;
                            }

                            if (!IG || !IID || !key || !token || !tokenExpiryInterval) {
                                throw new Error('Failed to extract required config fields from Bing Translator');
                            }

                            this.globalConfig = {
                                IG,
                                IID,
                                key,
                                token,
                                tokenTs: Date.now(),
                                tokenExpiryInterval
                            };

                            resolve(this.globalConfig);
                        } catch (error) {
                            reject(new Error('Failed to parse Bing Translator config: ' + error.message));
                        }
                    });
                }).on('error', (error) => {
                    reject(new Error('Network error while fetching config: ' + error.message));
                });
            };

            fetchUrl('https://www.bing.com/translator');
        });
    }

    isTokenExpired() {
        if (!this.globalConfig) {
            return true;
        }
        const { tokenTs, tokenExpiryInterval } = this.globalConfig;
        return Date.now() - tokenTs > tokenExpiryInterval;
    }

    async translate(text, fromLang, toLang) {
        if (!this.configPromise) {
            this.configPromise = this.fetchGlobalConfig();
        }

        await this.configPromise;

        if (this.isTokenExpired()) {
            this.configPromise = this.fetchGlobalConfig();
            await this.configPromise;
        }

        const { IG, IID, key, token } = this.globalConfig;

        const requestBody = querystring.stringify({
            fromLang: fromLang || 'auto-detect',
            to: toLang || 'en',
            text: text,
            token: token,
            key: key
        });

        const requestUrl = `/ttranslatev3?isVertical=1&IG=${IG}&IID=${IID}`;

        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.hostname,
                port: 443,
                path: requestUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(requestBody),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
                    'Referer': `https://${this.hostname}/translator`
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);

                        if (response.ShowCaptcha) {
                            reject(new Error('Translation service requires captcha verification'));
                            return;
                        }

                        if (response.StatusCode === 401 || res.statusCode === 401) {
                            reject(new Error('Translation limit exceeded (401)'));
                            return;
                        }

                        if (response.statusCode) {
                            reject(new Error('Translation service error: ' + response.statusCode));
                            return;
                        }

                        if (response[0] && response[0].translations && response[0].translations[0]) {
                            const translation = response[0].translations[0].text;
                            resolve(translation);
                        } else {
                            reject(new Error('Invalid translation response format'));
                        }
                    } catch (error) {
                        reject(new Error('Failed to parse translation response: ' + error.message));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error('Network error during translation: ' + error.message));
            });

            req.write(requestBody);
            req.end();
        });
    }
}

module.exports = BingTranslator;
