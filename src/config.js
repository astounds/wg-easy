'use strict';

const ip = require('ip');

const { release } = require('./package.json');

function getNextIPv6Address(currentIPv6) {
  const parts = currentIPv6.split(':');
  let lastPart = parseInt(parts[parts.length - 1], 16);
  lastPart++;
  parts[parts.length - 1] = lastPart.toString(16);
  return parts.join(':');
}

module.exports.RELEASE = release;
module.exports.PORT = process.env.PORT || '51821';
module.exports.WEBUI_HOST = process.env.WEBUI_HOST || '0.0.0.0';
module.exports.PASSWORD = process.env.PASSWORD;
module.exports.WG_PATH = process.env.WG_PATH || '/etc/wireguard/';
module.exports.WG_DEVICE = process.env.WG_DEVICE || 'eth0';
module.exports.WG_HOST = process.env.WG_HOST;
module.exports.WG_PORT = process.env.WG_PORT || '51820';
module.exports.WG_MTU = process.env.WG_MTU || null;
module.exports.WG_SRV_MTU = process.env.WG_SRV_MTU || 1420;
module.exports.WG_PERSISTENT_KEEPALIVE = process.env.WG_PERSISTENT_KEEPALIVE || '0';
module.exports.WG_DEFAULT_ADDRESS = process.env.WG_DEFAULT_ADDRESS || '10.8.0.0';
module.exports.WG_DEFAULT_ADDRESS6 = process.env.WG_DEFAULT_ADDRESS6 || 'fd42:42:42::0';
module.exports.WG_DEFAULT_ADDRESS_RANGE = process.env.WG_DEFAULT_ADDRESS_RANGE || '24';
module.exports.WG_DEFAULT_ADDRESS_RANGE6 = process.env.WG_DEFAULT_ADDRESS_RANGE6 || '64';
module.exports.WG_DEFAULT_DNS = typeof process.env.WG_DEFAULT_DNS === 'string'
  ? process.env.WG_DEFAULT_DNS
  : '84.200.69.80';
module.exports.WG_DEFAULT_DNS6 = typeof process.env.WG_DEFAULT_DNS6 === 'string'
  ? process.env.WG_DEFAULT_DNS6
  : '2001:1608:10:25::1c04:b12f';
module.exports.WG_ALLOWED_IPS = process.env.WG_ALLOWED_IPS || '0.0.0.0/0, ::/0';

// Set WG_POST_UP to allow IPv6 NAT and forwarding only if the required kernel module is available
const modules = childProcess.execSync('lsmod', {
  shell: 'bash',
});
module.exports.WG_PRE_UP = process.env.WG_PRE_UP || '';
module.exports.WG_POST_UP = process.env.WG_POST_UP;
if (!process.env.WG_POST_UP) {
  module.exports.WG_POST_UP = `
  iptables -t nat -A POSTROUTING -s ${module.exports.WG_DEFAULT_ADDRESS.replace('x', '0')}/24 -o ${module.exports.WG_DEVICE} -j MASQUERADE;
  iptables -A INPUT -p udp -m udp --dport ${module.exports.WG_PORT} -j ACCEPT;
  iptables -A FORWARD -i wg0 -j ACCEPT;
  iptables -A FORWARD -o wg0 -j ACCEPT;`;

  if (modules.includes('ip6table_nat')) {
    module.exports.WG_POST_UP += `
    ip6tables -t nat -A POSTROUTING -s ${module.exports.WG_DEFAULT_ADDRESS6.replace('x', '0')}/64 -o ${module.exports.WG_DEVICE} -j MASQUERADE;
    ip6tables -A INPUT -p udp -m udp --dport ${module.exports.WG_PORT} -j ACCEPT;
    ip6tables -A FORWARD -i wg0 -j ACCEPT;
    ip6tables -A FORWARD -o wg0 -j ACCEPT;`;
  }

  module.exports.WG_POST_UP = module.exports.WG_POST_UP.split('\n').join(' ');
}

module.exports.WG_PRE_DOWN = process.env.WG_PRE_DOWN || '';
module.exports.WG_POST_DOWN = process.env.WG_POST_DOWN;
if (!process.env.WG_POST_DOWN) {
  module.exports.WG_POST_DOWN = `
  iptables -t nat -D POSTROUTING -s ${module.exports.WG_DEFAULT_ADDRESS.replace('x', '0')}/24 -o ${module.exports.WG_DEVICE} -j MASQUERADE;
  iptables -D INPUT -p udp -m udp --dport ${module.exports.WG_PORT} -j ACCEPT;
  iptables -D FORWARD -i wg0 -j ACCEPT;
  iptables -D FORWARD -o wg0 -j ACCEPT;`;

  if (modules.includes('ip6table_nat')) {
    module.exports.WG_POST_UP += `
    ip6tables -t nat -D POSTROUTING -s ${module.exports.WG_DEFAULT_ADDRESS6.replace('x', '0')}/64 -o ${module.exports.WG_DEVICE} -j MASQUERADE;
    ip6tables -D INPUT -p udp -m udp --dport ${module.exports.WG_PORT} -j ACCEPT;
    ip6tables -D FORWARD -i wg0 -j ACCEPT;
    ip6tables -D FORWARD -o wg0 -j ACCEPT;`;
  }

  module.exports.WG_POST_UP = module.exports.WG_POST_UP.split('\n').join(' ');
}
module.exports.LANG = process.env.LANG || 'en';
module.exports.UI_TRAFFIC_STATS = process.env.UI_TRAFFIC_STATS || 'false';
module.exports.UI_CHART_TYPE = process.env.UI_CHART_TYPE || 0;
