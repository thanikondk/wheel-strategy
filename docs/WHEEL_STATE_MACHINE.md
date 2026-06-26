# Wheel State Machine

States:

- WATCHING
- CSP_PLANNED
- CSP_OPEN
- CSP_PROFIT_TAKEN
- CSP_EXPIRED
- CSP_ASSIGNED
- SHARES_OWNED
- CC_PLANNED
- CC_OPEN
- CC_PROFIT_TAKEN
- CC_EXPIRED
- SHARES_CALLED_AWAY
- WHEEL_COMPLETED
- PAUSED
- CLOSED

Events update:

- Premiums collected.
- Shares owned.
- Adjusted cost basis.
- Realized P&L.
- Unrealized P&L.
- Journal requirement.
- Next recommended action.

Invalid transitions throw explicit errors.
