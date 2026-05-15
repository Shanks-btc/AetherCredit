interface Props {
  verified: boolean
}

export function VerifiedBadge({ verified }: Props) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400 border border-green-700">
      ✓ TEE Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400 border border-red-700">
      ✗ Unverified
    </span>
  )
}