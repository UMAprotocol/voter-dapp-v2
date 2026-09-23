const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;

const sentCommitPhaseNotifications = [];
const sentRevealPhaseNotifications = [];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("SW: install", event);
  setInterval(poll, oneSecond);
});

function poll() {
  const commitPhaseEnd = getCommitPhaseEnd();
  const revealPhaseEnd = getRevealPhaseEnd();

  const now = new Date();

  console.log(`Polling at ${now}`, { commitPhaseEnd, revealPhaseEnd });

  if (commitPhaseEnd < now && !sentCommitPhaseNotifications.includes(commitPhaseEnd.getTime())) {
    showNotificationForPhase("Commit");
    sentCommitPhaseNotifications.push(commitPhaseEnd.getTime());
  }

  if (revealPhaseEnd < now && !sentRevealPhaseNotifications.includes(revealPhaseEnd.getTime())) {
    showNotificationForPhase("Reveal");
    sentRevealPhaseNotifications.push(revealPhaseEnd.getTime());
  }
}

function getCommitPhaseEnd() {
  const commitPhaseEnd = new Date("2022-07-15T14:24:00");
  return commitPhaseEnd;
}

function getRevealPhaseEnd() {
  const revealPhaseEnd = new Date("2022-07-15T14:25:00");
  return revealPhaseEnd;
}

function showNotification(title, options) {
  self.registration.showNotification(title, options);
}

function showNotificationForPhase(phase) {
  const title = `${phase} ends in 1 hour`;
  const options = {
    body: `TODO add body text for ${phase}`,
  };
  showNotification(title, options);
}
