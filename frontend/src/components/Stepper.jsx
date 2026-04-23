import React from 'react';
import { colors, radius } from '../theme';

function Stepper({ steps, activeIndex }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '32px',
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;

        const bubbleBg = isComplete
          ? colors.accent
          : isActive
            ? '#ffffff'
            : 'rgba(255, 255, 255, 0.55)';
        const bubbleColor = isComplete
          ? '#ffffff'
          : isActive
            ? colors.accent
            : colors.textSubtle;
        const bubbleBorder = isActive
          ? `2px solid ${colors.accent}`
          : `1px solid ${colors.border}`;

        const labelColor = isActive
          ? colors.text
          : isComplete
            ? colors.accent
            : colors.textSubtle;

        return (
          <React.Fragment key={step.key || step.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px 6px 6px',
                borderRadius: radius.pill,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                boxShadow: isActive ? '0 6px 16px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: bubbleBorder,
                  backgroundColor: bubbleBg,
                  color: bubbleColor,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  boxShadow: isActive ? '0 4px 10px rgba(15, 118, 110, 0.22)' : 'none',
                }}
              >
                {isComplete ? '✓' : index + 1}
              </div>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: labelColor,
                  letterSpacing: '0.01em',
                }}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: '28px',
                  height: '2px',
                  borderRadius: '2px',
                  backgroundColor: isComplete ? colors.accent : 'rgba(148, 163, 184, 0.4)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;
