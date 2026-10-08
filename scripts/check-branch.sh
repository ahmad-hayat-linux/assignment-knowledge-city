#!/bin/sh
# Branch policy, run by the Husky hooks.
#   check-branch.sh commit                       checks the current branch before a commit
#   check-branch.sh push <remote_ref>            checks the branch being pushed to
# Rules:
#   1. No commits or pushes on main (or master). Work on a branch and merge through a pull request.
#   2. Branch names are feature/*, epic/* or bug/*, followed by a short name made of lowercase
#      letters, digits and hyphens. Examples: feature/slab-breakdown, epic/browser-support, bug/rounding-half.
# Escape hatch for an emergency only: SKIP_BRANCH_POLICY=1 git commit ...

PROTECTED_BRANCHES="main master"
NAME_PATTERN='^(feature|epic|bug)/[a-z0-9]+(-[a-z0-9]+)*$'

if [ "$SKIP_BRANCH_POLICY" = "1" ]; then
  echo "branch policy: skipped (SKIP_BRANCH_POLICY=1)"
  exit 0
fi

is_protected() {
  for protected in $PROTECTED_BRANCHES; do
    [ "$1" = "$protected" ] && return 0
  done
  return 1
}

mode="$1"

if [ "$mode" = "push" ]; then
  target="${2#refs/heads/}"
  if is_protected "$target"; then
    echo "branch policy: pushing to '$target' is not allowed. Push a branch and open a pull request."
    exit 1
  fi
  exit 0
fi

branch="$(git symbolic-ref --short -q HEAD)"

# Detached HEAD (for example in the middle of a rebase): nothing to check.
if [ -z "$branch" ]; then
  exit 0
fi

if is_protected "$branch"; then
  echo "branch policy: committing directly on '$branch' is not allowed."
  echo "Create a branch first, for example: git switch -c feature/short-description"
  exit 1
fi

if ! echo "$branch" | grep -Eq "$NAME_PATTERN"; then
  echo "branch policy: branch name '$branch' is not valid."
  echo "Use feature/*, epic/* or bug/* with a lowercase name of letters, digits and hyphens."
  echo "Examples: feature/slab-breakdown, epic/browser-support, bug/rounding-half"
  exit 1
fi

exit 0
