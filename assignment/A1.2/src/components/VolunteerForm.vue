<template>
  <section id="volunteer" class="volunteer" aria-labelledby="volunteer-title">
    <div class="volunteer__inner">
      <h2 id="volunteer-title" class="volunteer__title">Get Involved</h2>

      <form class="volunteer-form" novalidate @submit.prevent>
        <div class="volunteer-form__field">
          <label for="full-name">Full Name</label>
          <input id="full-name" name="fullName" type="text" autocomplete="name" />
        </div>

        <div class="volunteer-form__field">
          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            type="text"
            inputmode="email"
            autocomplete="email"
          />
        </div>

        <div class="volunteer-form__field">
          <label for="suburb">Suburb</label>
          <input id="suburb" name="suburb" type="text" autocomplete="address-level2" />
        </div>

        <div class="volunteer-form__field">
          <label for="preferred-activity">Preferred Activity</label>
          <select id="preferred-activity" name="preferredActivity">
            <option value=""></option>
          </select>
        </div>

        <button class="volunteer-form__submit" type="submit">Submit Interest</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.volunteer {
  width: 100%;
  padding: 4rem 1rem;
}

.volunteer__inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.volunteer__title {
  margin-bottom: 2rem;
  color: #173d24;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.volunteer-form {
  width: 100%;
  max-width: 40rem;
}

.volunteer-form__field {
  margin-bottom: 1.25rem;
}

.volunteer-form__field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #173d24;
  font-weight: 600;
}

.volunteer-form__field input,
.volunteer-form__field select {
  display: block;
  width: 100%;
  min-height: 3rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid #879b8c;
  border-radius: 0.5rem;
  background: #ffffff;
  font: inherit;
}

.volunteer-form__submit {
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #2f6b3b;
  border-radius: 0.5rem;
  color: #ffffff;
  background: #2f6b3b;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

@media (min-width: 576px) {
  .volunteer {
    padding-inline: 1.5rem;
  }

  .volunteer-form__submit {
    width: auto;
  }
}

@media (min-width: 992px) {
  .volunteer {
    padding-inline: 2rem;
  }
}
</style>
