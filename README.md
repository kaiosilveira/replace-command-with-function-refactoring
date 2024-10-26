[![Continuous Integration](https://github.com/kaiosilveira/replace-command-with-function-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/replace-command-with-function-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Replace Command With Function

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
class ChargeCalculator {
  constructor(customer, usage) {
    this._customer = customer;
    this._usage = usage;
  }

  execute() {
    return this._customer.rate * this._usage;
  }
}
```

</td>

<td>

```javascript
function charge(customer, usage) {
  return customer.rate * usage;
}
```

</td>
</tr>
</tbody>
</table>

**Inverse of: [Replace Function with Command](https://github.com/kaiosilveira/replace-function-with-command-refactoring)**

Commands are powerful coding constructs that provide us with greater levels of control over parameters, initialization, and code separation. Sometimes, though, a function is more than enough to accomplish a simple task, providing minimal overhead and a straight-to-the-point approach. This refactoring helps with converting commands into regular functions.

## Working example

Our working example is a simple program that calculates a charge based on a customer, usage info, and a provider. The `ChargeCalculator` class looks like this:

```javascript
export class ChargeCalculator {
  constructor(customer, usage, provider) {
    this._customer = customer;
    this._usage = usage;
    this._provider = provider;
  }

  get baseCharge() {
    return this._customer.baseRate * this._usage;
  }

  get charge() {
    return this.baseCharge + this._provider.connectionCharge;
  }
}
```

and it's used at the top-level like this:

```javascript
export function calculateMonthCharge(customer, usage, provider) {
  const monthCharge = new ChargeCalculator(customer, usage, provider).charge;
  return monthCharge;
}
```

Since the `ChargeCalculator` [command](https://github.com/kaiosilveira/design-patterns/tree/main/command) is so simple, our goal here is to make it into a function, reducing instantiation overhead and optimizing for readability.

### Test suite

The test suite is as simple as the class itself:

```javascript
describe('ChargeCalculator', () => {
  it('calculates the charge', () => {
    const usage = 100;
    const customer = { baseRate: 10 };
    const provider = { connectionCharge: 5 };

    const chargeCalculator = new ChargeCalculator(customer, usage, provider);

    expect(chargeCalculator.charge).toBe(1005);
  });
});
```

That should be enough to allow us to proceed safely.

### Steps

We start by extracting the `ChargeCalculator` usage into a `charge` function at the top-level `calculateMonthCharge`:

```diff
diff --git top-level...
 export function calculateMonthCharge(customer, usage, provider) {
-  const monthCharge = new ChargeCalculator(customer, usage, provider).charge;
+  const monthCharge = charge(customer, usage, provider);
   return monthCharge;
 }
+
+function charge(customer, usage, provider) {
+  return new ChargeCalculator(customer, usage, provider).charge;
+}
```

Then, we extract the `baseCharge` variable at `ChargeCalculator`:

```diff
diff --git ChargeCalculator...
export class ChargeCalculator {
   }
   get charge() {
-    return this.baseCharge + this._provider.connectionCharge;
+    const baseCharge = this.baseCharge;
+    return baseCharge + this._provider.connectionCharge;
   }
 }
```

Following it with an [inline](https://github.com/kaiosilveira/inline-variable-refactoring) the `baseCharge` getter altogether:

```diff
diff --git ChargeCalculator...
export class ChargeCalculator {

   get charge() {
-    const baseCharge = this.baseCharge;
+    const baseCharge = this._customer.baseRate * this._usage;
     return baseCharge + this._provider.connectionCharge;
   }
 }
```

Leading up to a safe removal of the (now unused) `baseCharge` getter:

```diff
diff --git ChargeCalculator...
export class ChargeCalculator {
-  get baseCharge() {
-    return this._customer.baseRate * this._usage;
-  }
```

Now, on to the change itself, we first need to make the `charge` getter into a function, so we can later [parameterize](https://github.com/kaiosilveira/parameterize-function-refactoring) it:

```diff
diff --git ChargeCalculator...
-  get charge() {
+  charge() {

diff --git top-level...
 function charge(customer, usage, provider) {
-  return new ChargeCalculator(customer, usage, provider).charge;
+  return new ChargeCalculator(customer, usage, provider).charge();
 }
```

And now we can start moving the parameters out of `ChargeCalculator`'s constructor and into `charge`. We start with `customer`:

```diff
diff --git ChargeCalculator...
 export class ChargeCalculator {
-  constructor(customer, usage, provider) {
-    this._customer = customer;
+  constructor(usage, provider) {
     this._usage = usage;
     this._provider = provider;
   }
-  charge() {
-    const baseCharge = this._customer.baseRate * this._usage;
+  charge(customer) {
+    const baseCharge = customer.baseRate * this._usage;
     return baseCharge + this._provider.connectionCharge;
   }
 }

diff --git top-level...
 function charge(customer, usage, provider) {
-  return new ChargeCalculator(customer, usage, provider).charge();
+  return new ChargeCalculator(usage, provider).charge(customer);
 }
```

then, the same goes for `usage`:

```diff
diff --git ChargeCalculator...
 export class ChargeCalculator {
-  constructor(usage, provider) {
-    this._usage = usage;
+  constructor(provider) {
     this._provider = provider;
   }
-  charge(customer) {
-    const baseCharge = customer.baseRate * this._usage;
+  charge(customer, usage) {
+    const baseCharge = customer.baseRate * usage;
     return baseCharge + this._provider.connectionCharge;
   }
 }

diff --git top-level...
 function charge(customer, usage, provider) {
-  return new ChargeCalculator(usage, provider).charge(customer);
+  return new ChargeCalculator(provider).charge(customer, usage);
 }
```

...and for `provider`:

```diff
diff --git ChargeCalculator...
 export class ChargeCalculator {
-  constructor(provider) {
-    this._provider = provider;
-  }
+  constructor() {}
-  charge(customer, usage) {
+  charge(customer, usage, provider) {
     const baseCharge = customer.baseRate * usage;
-    return baseCharge + this._provider.connectionCharge;
+    return baseCharge + provider.connectionCharge;
   }
 }

diff --git top-level...
 function charge(customer, usage, provider) {
-  return new ChargeCalculator(provider).charge(customer, usage);
+  return new ChargeCalculator().charge(customer, usage, provider);
 }
```

Now everything is in place - we can inline `ChargeCalculator` at top-level `charge` function:

```diff
diff --git top-level...
 function charge(customer, usage, provider) {
-  return new ChargeCalculator().charge(customer, usage, provider);
+  const baseCharge = customer.baseRate * usage;
+  return baseCharge + provider.connectionCharge;
 }
```

And remove `ChargeCalculator` altogether:

```diff
diff --git ChargeCalculator...
-export class ChargeCalculator {
-  constructor() {}
-
-  charge(customer, usage, provider) {
-    const baseCharge = customer.baseRate * usage;
-    return baseCharge + provider.connectionCharge;
-  }
-}
```

And that's it for this one!

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                           | Message                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [68ad9d9](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/68ad9d9be5a6195e663f9cdae09614775f54cac8) | extract `ChargeCalculator` usage into a `charge` function at `calculateMonthCharge` |
| [22f71e6](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/22f71e6397439f822693dc8016390514b8fb43ba) | extract `baseCharge` variable at `ChargeCalculator.charge`                          |
| [365bf42](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/365bf42661c8b77f12a993826fb65daab82204f3) | inline `baseCharge` getter at `ChargeCalculator.charge`                             |
| [c4c6b79](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/c4c6b7945e6641300d2ba4b3044bce442c6eac15) | remove unused `baseCharge` getter from `ChargeCalculator`                           |
| [2600335](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/2600335f4f2d86516249371243e71f5a3fdfd51f) | make `ChargeCalculator.charge` getter into a function                               |
| [eec44ee](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/eec44eea4a0ac3eb94ebc92a9b6639c2b98e5874) | move `customer` from ctor dep to method argument at `ChargeCalculator.charge`       |
| [d0122f5](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/d0122f5b9d1f61e308664da3375f7777ae8d9197) | move `usage` from ctor dep to method argument at `ChargeCalculator.charge`          |
| [8c13ef4](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/8c13ef45cbf28a4163bc454988728d3050bb8305) | move `provider` from ctor dep to method argument at `ChargeCalculator.charge`       |
| [960374f](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/960374f1062eadaf68485c655798dfc1b99f0bb6) | inline `ChargeCalculator` at top-level `charge`                                     |
| [7a8bba2](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commit/7a8bba2b618f9876a90b2aba11097381fa45ae37) | remove `ChargeCalculator`                                                           |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-command-with-function-refactoring/commits/main).
