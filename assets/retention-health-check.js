(() => {
  const form = document.querySelector('[data-retention-check]');
  const result = document.querySelector('[data-retention-result]');
  if (!form || !result) return;

  const nextByTopic = {
    repeat: 'Measure repeat purchase and churn by customer or account segment. Find where the drop starts before choosing a campaign.',
    recovery: 'Review the last five customer problems. Check ownership, response time and whether the customer knew the issue was actually closed.',
    visibility: 'Create one simple lost-customer reason log. Do not guess. Record why an account stopped, paused or switched.',
    followup: 'Define one useful post-sale or post-recovery follow-up. The goal is relevance and continuity, not more messages.',
    friction: 'Walk through buying, paying and getting support on a phone. Remove the most repeated avoidable step first.'
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const selected = [...form.querySelectorAll('input[type="radio"]:checked')];
    const total = selected.reduce((sum, input) => sum + Number(input.value), 0);

    let title, summary;
    if (total <= 3) {
      title = 'Healthy base — protect it.';
      summary = 'Your answers suggest the core retention system is relatively healthy. The next opportunity is to protect consistency and deepen preference without adding unnecessary complexity.';
    } else if (total <= 6) {
      title = 'Watch zone — one leak is becoming expensive.';
      summary = 'Your answers suggest retention is not broken everywhere, but inconsistency is creating avoidable risk. Fix the clearest operational leak before adding loyalty tactics.';
    } else {
      title = 'High retention risk — diagnose before you promote.';
      summary = 'Your answers suggest customers may be experiencing multiple reasons to leave. Prioritise the operating experience first; discounts or loyalty campaigns may mask rather than solve the problem.';
    }

    const riskiest = selected
      .map((input, index) => ({ topic: input.dataset.topic, score: Number(input.value), index }))
      .sort((a, b) => b.score - a.score || a.index - b.index)[0];

    result.querySelector('[data-retention-score]').textContent = `Directional score: ${total}/10`;
    result.querySelector('[data-retention-title]').textContent = title;
    result.querySelector('[data-retention-summary]').textContent = summary;
    result.querySelector('[data-retention-next]').textContent = nextByTopic[riskiest.topic] || nextByTopic.repeat;
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
})();
